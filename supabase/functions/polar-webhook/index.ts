import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

// ============================================================
// Standard Webhooks Signature Verification (Polar uses this)
// ============================================================

function base64Decode(input: string): Uint8Array {
  // Handle base64url or standard base64
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function verifyWebhookSignature(
  body: string,
  headers: {
    webhookId: string;
    webhookTimestamp: string;
    webhookSignature: string;
  },
  secret: string,
): Promise<boolean> {
  // Standard Webhooks: secret is prefixed with "whsec_"
  const secretBytes = base64Decode(secret.startsWith("whsec_") ? secret.slice(6) : secret);

  // Construct the signed content: "{msg_id}.{timestamp}.{body}"
  const signedContent = `${headers.webhookId}.${headers.webhookTimestamp}.${body}`;

  // Verify timestamp is within tolerance (5 minutes)
  const timestamp = parseInt(headers.webhookTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    console.error("Webhook timestamp too old or too new:", { timestamp, now, diff: now - timestamp });
    return false;
  }

  // Compute HMAC-SHA256
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent),
  );

  const expectedSig = bytesToBase64(new Uint8Array(signature));

  // The signature header can contain multiple sigs separated by spaces
  // Each is prefixed with "v1,"
  const signatures = headers.webhookSignature.split(" ");
  for (const sig of signatures) {
    const [version, sigValue] = sig.split(",");
    if (version === "v1" && sigValue === expectedSig) {
      return true;
    }
  }

  console.error("No matching signature found");
  return false;
}

// ============================================================
// Token Calculation (SERVER-SIDE ONLY)
// $3 = 1500 tokens → 500 tokens per dollar → 5 tokens per cent
// ============================================================
function calculateTokens(amountCents: number): number {
  return amountCents * 5;
}

// ============================================================
// Main Handler
// ============================================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const webhookSecret = Deno.env.get("POLAR_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!webhookSecret) {
    console.error("POLAR_WEBHOOK_SECRET not configured");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const rawBody = await req.text();

    // Extract Standard Webhooks headers
    const webhookId = req.headers.get("webhook-id") ?? "";
    const webhookTimestamp = req.headers.get("webhook-timestamp") ?? "";
    const webhookSignature = req.headers.get("webhook-signature") ?? "";

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      console.error("Missing webhook headers");
      return new Response(JSON.stringify({ error: "Missing webhook headers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify signature
    const isValid = await verifyWebhookSignature(
      rawBody,
      { webhookId, webhookTimestamp, webhookSignature },
      webhookSecret,
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Webhook signature verified successfully");

    // Parse event
    const event = JSON.parse(rawBody);
    const eventType = event.type;

    console.log("Received Polar event:", eventType);

    // We only care about order.created for token fulfillment
    if (eventType !== "order.created") {
      console.log(`Ignoring event type: ${eventType}`);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = event.data;
    const orderId = order.id;
    const amountCents = order.amount; // Amount in cents
    const currency = order.currency;
    const customerEmail = order.customer?.email ?? order.customer_email ?? null;
    const checkoutId = order.checkout_id ?? null;

    // Get the supabase_user_id from order metadata
    const supabaseUserId = order.metadata?.supabase_user_id ?? null;

    console.log("Order details:", {
      orderId,
      amountCents,
      currency,
      customerEmail,
      supabaseUserId,
      checkoutId,
    });

    if (!supabaseUserId) {
      console.error("No supabase_user_id in order metadata. Cannot credit tokens.");
      // Still return 200 to prevent Polar from retrying
      return new Response(
        JSON.stringify({ error: "Missing supabase_user_id in metadata" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Idempotency check: has this order already been processed?
    const { data: existing } = await supabase
      .from("token_transactions")
      .select("id")
      .eq("polar_order_id", orderId)
      .maybeSingle();

    if (existing) {
      console.log(`Order ${orderId} already processed. Skipping duplicate.`);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate tokens: cents × 5
    const tokensGranted = calculateTokens(amountCents);

    console.log(`Granting ${tokensGranted} tokens for $${(amountCents / 100).toFixed(2)} payment`);

    // 1. Insert transaction record
    const { error: txError } = await supabase.from("token_transactions").insert({
      user_id: supabaseUserId,
      amount_cents: amountCents,
      tokens_granted: tokensGranted,
      polar_order_id: orderId,
      polar_checkout_id: checkoutId,
      customer_email: customerEmail,
      status: "completed",
    });

    if (txError) {
      console.error("Failed to insert token transaction:", txError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Credit purchased_tokens to user
    // First check if user_credits row exists
    const { data: userCredits, error: fetchError } = await supabase
      .from("user_credits")
      .select("purchased_tokens")
      .eq("user_id", supabaseUserId)
      .maybeSingle();

    if (fetchError) {
      console.error("Failed to fetch user credits:", fetchError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (userCredits) {
      // Update existing row
      const newTotal = (userCredits.purchased_tokens ?? 0) + tokensGranted;
      const { error: updateError } = await supabase
        .from("user_credits")
        .update({ purchased_tokens: newTotal, updated_at: new Date().toISOString() })
        .eq("user_id", supabaseUserId);

      if (updateError) {
        console.error("Failed to update purchased_tokens:", updateError);
        return new Response(JSON.stringify({ error: "Database error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Create new row (edge case: user doesn't have credits row yet)
      const { error: insertError } = await supabase.from("user_credits").insert({
        user_id: supabaseUserId,
        credits: 100,
        purchased_tokens: tokensGranted,
        last_reset_date: new Date().toISOString().split("T")[0],
      });

      if (insertError) {
        console.error("Failed to insert user credits:", insertError);
        return new Response(JSON.stringify({ error: "Database error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log(`Successfully credited ${tokensGranted} tokens to user ${supabaseUserId}`);

    return new Response(
      JSON.stringify({
        received: true,
        tokens_granted: tokensGranted,
        user_id: supabaseUserId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
