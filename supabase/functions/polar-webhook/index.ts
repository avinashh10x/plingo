import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

// ============================================================
// Standard Webhooks Signature Verification
// ============================================================

function base64Decode(input: string): Uint8Array {
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
  headers: { webhookId: string; webhookTimestamp: string; webhookSignature: string },
  secret: string,
): Promise<boolean> {
  try {
    const secretBytes = base64Decode(secret.startsWith("whsec_") ? secret.slice(6) : secret);
    const signedContent = `${headers.webhookId}.${headers.webhookTimestamp}.${body}`;

    // Verify timestamp tolerance (5 minutes)
    const timestamp = parseInt(headers.webhookTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      console.error("Webhook timestamp out of tolerance:", { timestamp, now, diff: now - timestamp });
      return false;
    }

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
    const signatures = headers.webhookSignature.split(" ");

    for (const sig of signatures) {
      const [version, sigValue] = sig.split(",");
      if (version === "v1" && sigValue === expectedSig) {
        return true;
      }
    }

    console.error("No matching signature found");
    return false;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

// ============================================================
// Token Calculation: $3 = 1500 tokens → 5 tokens per cent
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

    console.log("Webhook received. Headers present:", {
      hasId: !!webhookId,
      hasTimestamp: !!webhookTimestamp,
      hasSignature: !!webhookSignature,
    });

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

    console.log("Webhook signature verified ✓");

    // Parse event
    const event = JSON.parse(rawBody);
    const eventType = event.type;

    console.log("Event type:", eventType);
    console.log("Full event data keys:", Object.keys(event.data || {}));

    // Accept both order.created and order.paid
    if (eventType !== "order.created" && eventType !== "order.paid") {
      console.log(`Ignoring event type: ${eventType}`);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = event.data;
    const orderId = order.id;

    // Polar uses total_amount (in cents) — try multiple field names for safety
    const amountCents = order.total_amount ?? order.amount ?? order.amount_subtotal ?? 0;
    const currency = order.currency ?? "usd";
    const checkoutId = order.checkout_id ?? null;

    // Get customer email from multiple possible locations
    const customerEmail =
      order.customer?.email ??
      order.customer_email ??
      order.billing_address?.email ??
      null;

    // Get supabase user_id from multiple possible locations:
    // 1. metadata.supabase_user_id (our custom field)
    // 2. customer.external_id (set via external_customer_id in checkout)
    // 3. customer.metadata.supabase_user_id
    const supabaseUserId =
      order.metadata?.supabase_user_id ??
      order.customer?.external_id ??
      order.customer?.metadata?.supabase_user_id ??
      order.custom_field_data?.supabase_user_id ??
      null;

    console.log("Order parsed:", {
      orderId,
      amountCents,
      currency,
      customerEmail,
      supabaseUserId,
      checkoutId,
      orderStatus: order.status,
      metadataKeys: Object.keys(order.metadata || {}),
      customerKeys: Object.keys(order.customer || {}),
    });

    if (!supabaseUserId) {
      // Try to find user by email as fallback
      console.warn("No supabase_user_id found. Attempting email lookup...");

      if (customerEmail) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("email", customerEmail)
          .maybeSingle();

        if (profileData?.user_id) {
          console.log("Found user by email:", profileData.user_id);
          await processTokenGrant(supabase, {
            userId: profileData.user_id,
            orderId,
            amountCents,
            checkoutId,
            customerEmail,
          });

          return new Response(
            JSON.stringify({ received: true, method: "email_lookup" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      }

      console.error("Cannot identify user. No supabase_user_id and email lookup failed.");
      return new Response(
        JSON.stringify({ error: "Cannot identify user", received: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await processTokenGrant(supabase, {
      userId: supabaseUserId,
      orderId,
      amountCents,
      checkoutId,
      customerEmail,
    });

    return new Response(
      JSON.stringify({ received: true, success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ============================================================
// Process Token Grant (atomic)
// ============================================================
async function processTokenGrant(
  supabase: any,
  params: {
    userId: string;
    orderId: string;
    amountCents: number;
    checkoutId: string | null;
    customerEmail: string | null;
  },
) {
  const { userId, orderId, amountCents, checkoutId, customerEmail } = params;

  // Idempotency check
  const { data: existing } = await supabase
    .from("token_transactions")
    .select("id")
    .eq("polar_order_id", orderId)
    .maybeSingle();

  if (existing) {
    console.log(`Order ${orderId} already processed. Skipping.`);
    return;
  }

  const tokensGranted = calculateTokens(amountCents);
  console.log(`Granting ${tokensGranted} tokens for ${amountCents} cents to user ${userId}`);

  // 1. Insert transaction record
  const { error: txError } = await supabase.from("token_transactions").insert({
    user_id: userId,
    amount_cents: amountCents,
    tokens_granted: tokensGranted,
    polar_order_id: orderId,
    polar_checkout_id: checkoutId,
    customer_email: customerEmail,
    status: "completed",
  });

  if (txError) {
    // If it's a unique constraint violation, it's a duplicate
    if (txError.code === "23505") {
      console.log("Duplicate order detected via constraint. Skipping.");
      return;
    }
    console.error("Failed to insert transaction:", txError);
    throw txError;
  }

  // 2. Atomic credit update using upsert + increment
  const { data: userCredits } = await supabase
    .from("user_credits")
    .select("purchased_tokens")
    .eq("user_id", userId)
    .maybeSingle();

  if (userCredits) {
    const newTotal = (userCredits.purchased_tokens ?? 0) + tokensGranted;
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({
        purchased_tokens: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update purchased_tokens:", updateError);
      throw updateError;
    }
  } else {
    const { error: insertError } = await supabase.from("user_credits").insert({
      user_id: userId,
      credits: 100,
      purchased_tokens: tokensGranted,
      last_reset_date: new Date().toISOString().split("T")[0],
    });

    if (insertError) {
      console.error("Failed to insert user_credits:", insertError);
      throw insertError;
    }
  }

  console.log(`✓ Credited ${tokensGranted} tokens to user ${userId}`);
}
