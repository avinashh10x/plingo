import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Generate PKCE code verifier and challenge
function generatePKCE(): { verifier: string; challenge: string } {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  // For simplicity, using plain challenge method
  // In production, should use S256
  return { verifier, challenge: verifier };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("oauth-init: Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    return new Response(
      JSON.stringify({
        error: "Server misconfigured",
        details: "Missing backend environment variables",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Get auth header (case-insensitive fallback)
  const authHeader =
    req.headers.get("authorization") ?? req.headers.get("Authorization");

  if (!authHeader) {
    console.warn("oauth-init: Missing Authorization header", {
      headerKeys: Array.from(req.headers.keys()),
    });

    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        details: "Missing Authorization header",
      }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) {
    console.warn(
      "oauth-init: Authorization header present but JWT missing/empty"
    );
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        details: "Empty bearer token",
      }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Verify user with the provided JWT
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      console.warn("oauth-init: Unauthorized getUser()", authError);
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          details: authError?.message ?? "Invalid or expired session",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { platform } = await req.json();

    console.log(`Initiating OAuth for ${platform}, user: ${user.id}`);

    let authUrl: string;
    const pkce = generatePKCE();

    const appOrigin = req.headers.get("origin");

    // Create state with user info
    const state = btoa(
      JSON.stringify({
        user_id: user.id,
        code_verifier: pkce.verifier,
        timestamp: Date.now(),
        app_origin: appOrigin,
      })
    );

    const callbackUrl = `${supabaseUrl}/functions/v1/oauth-callback?platform=${platform}`;

    switch (platform) {
      case "twitter": {
        const twitterClientId = Deno.env.get("TWITTER_CLIENT_ID");

        if (!twitterClientId) {
          return new Response(
            JSON.stringify({ error: "Twitter not configured" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const scopes = [
          "tweet.read",
          "tweet.write",
          "users.read",
          "offline.access",
        ].join("%20");

        authUrl =
          `https://twitter.com/i/oauth2/authorize?` +
          `response_type=code&` +
          `client_id=${twitterClientId}&` +
          `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
          `scope=${scopes}&` +
          `state=${state}&` +
          `code_challenge=${pkce.challenge}&` +
          `code_challenge_method=plain`;
        break;
      }

      case "linkedin": {
        const linkedinClientId = Deno.env.get("LINKEDIN_CLIENT_ID");

        if (!linkedinClientId) {
          return new Response(
            JSON.stringify({ error: "LinkedIn not configured" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const scopes = ["openid", "profile", "email", "w_member_social"].join(
          "%20"
        );

        authUrl =
          `https://www.linkedin.com/oauth/v2/authorization?` +
          `response_type=code&` +
          `client_id=${linkedinClientId}&` +
          `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
          `scope=${scopes}&` +
          `state=${state}`;
        break;
      }

      case "facebook": {
        const facebookAppId = Deno.env.get("FACEBOOK_APP_ID");

        if (!facebookAppId) {
          return new Response(
            JSON.stringify({ error: "Facebook not configured" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const scopes = [
          "public_profile",
          "pages_manage_posts",
          "pages_read_engagement",
        ].join(",");

        authUrl =
          `https://www.facebook.com/v18.0/dialog/oauth?` +
          `client_id=${facebookAppId}&` +
          `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
          `scope=${scopes}&` +
          `state=${state}`;
        break;
      }

      case "threads": {
        const threadsAppId = Deno.env.get("THREADS_APP_ID");

        if (!threadsAppId) {
          return new Response(
            JSON.stringify({ error: "Threads not configured" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const scopes = ["threads_basic", "threads_content_publish"].join(",");

        authUrl =
          `https://threads.net/oauth/authorize?` +
          `client_id=${threadsAppId}&` +
          `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
          `scope=${scopes}&` +
          `response_type=code&` +
          `state=${state}`;
        break;
      }

      case "instagram": {
        // Instagram uses Facebook OAuth
        const facebookAppId = Deno.env.get("FACEBOOK_APP_ID");

        if (!facebookAppId) {
          return new Response(
            JSON.stringify({ error: "Instagram (Facebook) not configured" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const scopes = [
          "instagram_basic",
          "instagram_content_publish",
          "pages_read_engagement",
        ].join(",");

        authUrl =
          `https://www.facebook.com/v18.0/dialog/oauth?` +
          `client_id=${facebookAppId}&` +
          `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
          `scope=${scopes}&` +
          `state=${state}`;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Platform ${platform} not supported` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    console.log(`Generated OAuth URL for ${platform}`);

    return new Response(JSON.stringify({ url: authUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("OAuth init error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
