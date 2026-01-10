import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Fetch Signals - Supabase Edge Function
 * Triggered by QStash on a schedule (every 30-60 minutes)
 * Fetches signals from HN, GitHub and stores them in Supabase
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, upstash-signature",
};

// ==========================================
// SIGNAL FETCHERS (Embedded for Deno)
// ==========================================

interface Signal {
  domain: string;
  source: string;
  title: string;
  summary: string;
  url?: string;
  score: number;
}

async function fetchHackerNewsSignals(limit: number = 10): Promise<Signal[]> {
  const HN_API = "https://hacker-news.firebaseio.com/v0";

  try {
    const topRes = await fetch(`${HN_API}/topstories.json`);
    if (!topRes.ok) return [];

    const storyIds: number[] = await topRes.json();
    const topIds = storyIds.slice(0, limit);

    const stories = await Promise.all(
      topIds.map(async (id) => {
        try {
          const res = await fetch(`${HN_API}/item/${id}.json`);
          return res.ok ? res.json() : null;
        } catch {
          return null;
        }
      })
    );

    return stories
      .filter((s) => s !== null && s.title)
      .map((story) => ({
        domain: "tech",
        source: "hn",
        title: story.title,
        summary: `${story.score} points • ${
          story.descendants || 0
        } comments • by ${story.by}`,
        url: story.url,
        score: story.score,
      }));
  } catch (error) {
    console.error("HN fetch error:", error);
    return [];
  }
}

async function fetchGitHubTrendingSignals(
  limit: number = 10
): Promise<Signal[]> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const dateStr = since.toISOString().split("T")[0];

    const query = `created:>${dateStr} stars:>50`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
      query
    )}&sort=stars&order=desc&per_page=${limit}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "plingo-signal-fetcher",
      },
    });

    if (!res.ok) {
      console.error("GitHub API error:", res.status);
      return [];
    }

    const data = await res.json();
    const repos = data.items || [];

    return repos.map((repo: any) => ({
      domain: "tech",
      source: "github",
      title: repo.full_name,
      summary: `${repo.description || "No description"} • ⭐ ${
        repo.stargazers_count
      }${repo.language ? ` • ${repo.language}` : ""}`,
      url: repo.html_url,
      score: repo.stargazers_count,
    }));
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return [];
  }
}

// ==========================================
// QSTASH SIGNATURE VERIFICATION
// ==========================================

async function verifyQStashSignature(
  signature: string | null,
  body: string,
  signingKey: string
): Promise<boolean> {
  if (!signature || !signingKey) return false;

  try {
    // QStash signs with HMAC-SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(signingKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const signatureBytes = Uint8Array.from(atob(signature), (c) =>
      c.charCodeAt(0)
    );
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(body)
    );

    return isValid;
  } catch {
    return false;
  }
}

// ==========================================
// MAIN HANDLER
// ==========================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const qstashSigningKey = Deno.env.get("QSTASH_CURRENT_SIGNING_KEY");

  // Get request body for signature verification
  const bodyText = await req.text();

  // Verify QStash signature (optional but recommended)
  const signature = req.headers.get("upstash-signature");
  if (qstashSigningKey && signature) {
    const isValid = await verifyQStashSignature(
      signature,
      bodyText,
      qstashSigningKey
    );
    if (!isValid) {
      console.warn("Invalid QStash signature");
      // Continue anyway for now - can make strict later
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("Fetching signals from HN and GitHub...");

    // Fetch signals in parallel
    const [hnSignals, ghSignals] = await Promise.all([
      fetchHackerNewsSignals(10),
      fetchGitHubTrendingSignals(10),
    ]);

    console.log(
      `Fetched ${hnSignals.length} HN signals, ${ghSignals.length} GitHub signals`
    );

    const allSignals = [...hnSignals, ...ghSignals];

    if (allSignals.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No signals fetched (APIs may be rate limited)",
          fetched: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate expiration (2 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    // Prepare signals for upsert
    const signalsToInsert = allSignals.map((s) => ({
      ...s,
      fetched_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    }));

    // Delete old signals for these sources
    await supabase.from("signals").delete().in("source", ["hn", "github"]);

    // Insert new signals
    const { error: insertError } = await supabase
      .from("signals")
      .insert(signalsToInsert);

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({
          error: "Failed to store signals",
          details: insertError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Stored ${allSignals.length} signals successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        fetched: allSignals.length,
        sources: {
          hn: hnSignals.length,
          github: ghSignals.length,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Fetch signals error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
