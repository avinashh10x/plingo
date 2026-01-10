import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Agent Generate Content - Supabase Edge Function
 * Generates AI content using signals from the database
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ==========================================
// TYPES
// ==========================================

interface Signal {
  title: string;
  summary: string;
  source: string;
  score?: number;
}

interface AgentRequest {
  domain: string;
  persona: string;
  tone: string;
  contentType: string;
  count?: number;
  customInstructions?: string;
}

// ==========================================
// PROMPT BUILDER
// ==========================================

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional:
    "Write in a polished, business-appropriate tone. Be authoritative yet approachable.",
  casual:
    "Write like texting a friend. Relaxed, conversational, contractions encouraged.",
  opinionated:
    "Take a clear stance. Be bold, direct, and share strong perspectives.",
  witty:
    "Be clever and playful. Add subtle humor or wordplay. Smart, not cheesy.",
  formal:
    "Proper grammar, no contractions. Maintain a serious, dignified tone.",
};

const CONTENT_INSTRUCTIONS: Record<string, string> = {
  tweet:
    "Write a tweet under 280 characters. Hook readers instantly. 1-2 hashtags max.",
  thread:
    "Write a Twitter thread (3-5 tweets). Each under 280 chars. Connected narrative.",
  linkedin:
    "Write a LinkedIn post. Professional but engaging. Can be longer (1000 chars).",
  post: "Write a social media post. Concise, engaging, platform-flexible.",
};

function buildPrompt(request: AgentRequest, signals: Signal[]): string {
  const {
    domain,
    persona,
    tone,
    contentType,
    count = 1,
    customInstructions,
  } = request;

  const toneGuide = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.professional;
  const contentGuide =
    CONTENT_INSTRUCTIONS[contentType] || CONTENT_INSTRUCTIONS.post;

  const signalsList = signals
    .slice(0, 7)
    .map(
      (s, i) =>
        `${i + 1}. [${s.source.toUpperCase()}] ${s.title}\n   ${s.summary}`
    )
    .join("\n\n");

  let instruction = "";
  if (count > 1) {
    instruction = `Generate ${count} different ${contentType} variations. Each should take a unique angle. Number them 1 through ${count}.`;
  } else {
    instruction = `Generate a single ${contentType} that references or comments on one or more of these signals.`;
  }

  return `You are a content writer with the persona of: ${persona}

DOMAIN: ${domain.toUpperCase()}
TONE: ${tone.toUpperCase()}
${toneGuide}

CONTENT TYPE: ${contentType}
${contentGuide}

CORE RULES:
- Write like a human, not a marketer
- Be opinionated but ONLY based on the signals provided
- Do NOT invent facts beyond the given context
- Do NOT claim real-time or live knowledge
- Assume reader has basic ${domain} knowledge
- Never use generic filler phrases
- No markdown formatting in output

${
  customInstructions
    ? `ADDITIONAL INSTRUCTIONS:\n${customInstructions}\n\n`
    : ""
}
---

CURRENT SIGNALS (use these as your ONLY source of information):

${signalsList}

TASK:
${instruction}

Remember: Be authentic to your persona. Write content that would actually get engagement.`;
}

// ==========================================
// LLM CLIENTS
// ==========================================

const HF_API_URL = "https://router.huggingface.co/hf-inference/models";
const MISTRAL_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";
const LLAMA_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";

async function callHuggingFace(
  model: string,
  prompt: string,
  token: string,
  timeout: number = 30000
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${HF_API_URL}/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.8,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `${model} API error: ${response.status} - ${
          errorData.error || "Unknown"
        }`
      );
    }

    const data = await response.json();

    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.trim();
    }
    if (typeof data === "string") {
      return data.trim();
    }

    throw new Error("Unexpected response format");
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`${model} request timed out`);
    }
    throw error;
  }
}

async function callLLM(
  prompt: string,
  hfToken: string
): Promise<{ text: string; model: string }> {
  // Try Mistral first
  try {
    const text = await callHuggingFace(MISTRAL_MODEL, prompt, hfToken);
    return { text, model: "mistral-7b" };
  } catch (error: any) {
    console.warn("Mistral failed:", error.message);
  }

  // Fallback to Llama
  try {
    const text = await callHuggingFace(LLAMA_MODEL, prompt, hfToken);
    return { text, model: "llama-3" };
  } catch (error: any) {
    console.error("Llama also failed:", error.message);
    throw new Error(`All LLM attempts failed: ${error.message}`);
  }
}

// ==========================================
// RESPONSE PARSER
// ==========================================

function parseContent(text: string, expectedCount: number): string[] {
  let cleaned = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();

  if (expectedCount === 1) {
    return [cleaned];
  }

  const numberedPattern = /(?:^|\n)\s*(?:\d+[\.\)\/:]\s*)/;
  const parts = cleaned
    .split(numberedPattern)
    .filter((p) => p.trim().length > 0);

  if (parts.length >= expectedCount) {
    return parts.slice(0, expectedCount).map((p) => p.trim());
  }

  const byNewlines = cleaned.split(/\n\n+/).filter((p) => p.trim().length > 0);

  return byNewlines.length > 0 ? byNewlines.map((p) => p.trim()) : [cleaned];
}

// ==========================================
// MAIN HANDLER
// ==========================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const hfToken = Deno.env.get("HUGGINGFACE_TOKEN");

  if (!hfToken) {
    return new Response(
      JSON.stringify({
        error: "HUGGINGFACE_TOKEN not configured in Supabase secrets",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Verify user (optional - can be made public)
  const authHeader = req.headers.get("authorization");
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

  if (authHeader) {
    const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (jwt) {
      const { error: authError } = await supabaseAuth.auth.getUser(jwt);
      if (authError) {
        console.warn("Auth error (continuing anyway):", authError.message);
      }
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const startTime = Date.now();
    const body: AgentRequest = await req.json();

    const {
      domain = "tech",
      persona,
      tone = "professional",
      contentType = "tweet",
      count = 1,
    } = body;

    if (!persona) {
      return new Response(JSON.stringify({ error: "Persona is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch latest signals for domain
    const { data: signals, error: signalsError } = await supabase
      .from("signals")
      .select("title, summary, source, score")
      .eq("domain", domain)
      .order("score", { ascending: false })
      .limit(7);

    if (signalsError) {
      console.error("Signals fetch error:", signalsError);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch signals",
          details: signalsError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!signals || signals.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No signals available. Signal fetcher may not have run yet.",
          hint: "Trigger the fetch-signals function first.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build prompt
    const prompt = buildPrompt(body, signals);

    // Call LLM
    const { text, model } = await callLLM(prompt, hfToken);

    // Parse response
    const content = parseContent(text, count);

    const latencyMs = Date.now() - startTime;

    console.log(
      `Generated ${content.length} items using ${model} in ${latencyMs}ms`
    );

    return new Response(
      JSON.stringify({
        success: true,
        content,
        model,
        signalsUsed: signals.length,
        latencyMs,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Agent generate error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
