import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const polarAccessToken = Deno.env.get("POLAR_ACCESS_TOKEN");
  const polarProductId = Deno.env.get("POLAR_PRODUCT_ID");

  if (!polarAccessToken || !polarProductId) {
    console.error("Missing Polar configuration");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Authenticate the user via Supabase JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body for optional custom amount
    const body = await req.json().catch(() => ({}));
    const { amount, success_url } = body;

    // Build checkout request
    const checkoutPayload: Record<string, any> = {
      product_id: polarProductId,
      customer_email: user.email,
      success_url: success_url || `${req.headers.get("origin") || "https://plingo.dev"}/dashboard?payment=success`,
      metadata: {
        supabase_user_id: user.id,
      },
    };

    // If custom amount provided (in cents), include it for "pay what you want"
    if (amount && typeof amount === "number" && amount >= 100) {
      checkoutPayload.amount = amount;
    }

    console.log("Creating Polar checkout session:", {
      productId: polarProductId,
      userEmail: user.email,
      userId: user.id,
      amount: checkoutPayload.amount,
    });

    // Create checkout session via Polar API
    const polarResponse = await fetch("https://api.polar.sh/v1/checkouts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${polarAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutPayload),
    });

    const polarData = await polarResponse.json();

    if (!polarResponse.ok) {
      console.error("Polar API error:", polarData);
      return new Response(
        JSON.stringify({
          error: "Failed to create checkout session",
          details: polarData,
        }),
        {
          status: polarResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Polar checkout created:", polarData.id);

    // Return the checkout URL to the frontend
    return new Response(
      JSON.stringify({
        checkout_url: polarData.url,
        checkout_id: polarData.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Checkout creation error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
