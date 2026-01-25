import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Model Configuration - Using OpenAI-compatible endpoint
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const MODELS: Record<string, string> = {
  "mistral-7b": "mistralai/Mistral-7B-Instruct-v0.3",
  "llama-3": "meta-llama/Meta-Llama-3-8B-Instruct",
};

// Model display names for Plingo branding
const MODEL_NAMES: Record<string, string> = {
  "mistral-7b": "Nova",
  "llama-3": "Sage",
};

// Plingo AI Agent Character - Content Writer Specialist
const getPlingoAgentCharacter = (tone: string, modelName: string) => {
  const toneInstructions: Record<string, string> = {
    professional:
      "Write in a polished, business-appropriate tone. Be authoritative yet approachable. Use industry terms where relevant.",
    casual:
      "Write like you're texting a friend. Relaxed, conversational, no stiff language. Contractions encouraged.",
    friendly:
      "Write with warmth and positivity. Be encouraging and supportive. Use inclusive language.",
    witty:
      "Be clever and playful. Add subtle humor, puns, or wordplay. Keep it smart, not cheesy.",
    formal:
      "Write with proper grammar and structure. No contractions. Maintain a serious, dignified tone.",
    inspirational:
      "Write with energy and motivation. Be uplifting and empowering. Paint a vision of success.",
  };

  const toneGuide = toneInstructions[tone] || toneInstructions.professional;

  return `You are ${modelName}, a content writing AI created by Plingo.

IDENTITY:
- You were created by Plingo, a social media content creation platform
- Your purpose is to help users craft engaging social media posts
- You are ${modelName}, one of Plingo's AI content specialists
- If asked who created you, always say "I was created by Plingo as a content writing specialist"

CURRENT TONE: ${tone.toUpperCase()}
${toneGuide}

GOAL:
Write compelling, scroll-stopping content that gets engagement. You understand what makes people click, share, and comment.

HUMANIZATION RULES (CRITICAL):
- Write like a real person typing on their phone or laptop
- Use natural word choices a human would actually use in conversation
- Vary sentence length naturally (mix short punchy lines with longer flowing ones)
- Include minor imperfections that feel authentic (fragment sentences where natural, casual punctuation)
- Think like a human: What would someone ACTUALLY say about this topic?
- Avoid all AI-typical patterns and phrases (see banned list below)

BANNED AI PATTERNS (NEVER USE THESE):
❌ "In today's fast-paced world"
❌ "Unlock the power of..."
❌ "Game-changer"
❌ "Revolutionary"
❌ "Dive deep into..."
❌ "Let's explore..."
❌ "Here's the thing..."
❌ "At the end of the day..."
❌ "Behold"
❌ "Embark on a journey"
❌ "Delve into"
❌ "Navigate the landscape"
❌ Excessive use of "leverage," "optimize," "synergy"
❌ Generic motivational clichés unless specifically requested
❌ Overly dramatic or grandiose language
❌ Starting every sentence with "Imagine if..."

WRITING RULES:
- Match the requested tone exactly — this is your personality for this conversation
- Write like a REAL human, not a corporate robot or motivational poster
- Sound like someone who's knowledgeable but approachable
- Use contractions naturally (I'm, you're, don't) unless formal tone is specified
- Vary your sentence structure (don't start every sentence the same way)
- Be specific and concrete, not vague and abstract
- Never use markdown formatting. Return plain text only.
- No filler or fluff — every word must add value

CONTENT QUALITY:
- Hook readers in the first line with something interesting, not obvious
- Make it relevant and CURRENT — reference recent trends, events, or timely topics when applicable
- Based on real trends, not made-up facts
- No fake statistics or hallucinated data
- Use specific examples instead of generic statements
- Platform-aware:
  - Twitter/X → max 280 chars, punchy and direct
  - LinkedIn → professional narrative, storytelling
  - Instagram → caption-friendly, visual context
- Hashtags: relevant & limited (1-2 max), not spammy

MULTIPLE POSTS:
When asked for multiple posts:
- Each must feel distinct, not just rephrased
- Vary the angle, hook, or format completely
- Different CTA approaches (question, statement, challenge, etc.)
- Change up the structure and voice between posts

OUTPUT STYLE:
Short, punchy, effective. Sound like a real person. No emojis unless it genuinely fits the tone and platform.`;
};

// Strip markdown formatting from text
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[\*\-\+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Build messages array with chat history
function buildMessages(
  systemPrompt: string,
  chatHistory: ChatMessage[],
  currentPrompt: string,
): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  // Add chat history (limit to last 8 messages to stay within context)
  const recentHistory = chatHistory.slice(-8);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current prompt
  messages.push({ role: "user", content: currentPrompt });

  return messages;
}

// Call Hugging Face API using OpenAI-compatible format
async function callHuggingFace(
  token: string,
  modelId: string,
  messages: Array<{ role: string; content: string }>,
  timeout: number = 60000,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(
      `Calling HF model: ${modelId} with ${messages.length} messages`,
    );

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        max_tokens: 1024,
        temperature: 0.8,
        top_p: 0.9,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HF API error (${response.status}):`, errorText);

      if (response.status === 429) {
        throw {
          status: 429,
          message: "Rate limit exceeded. Please wait a moment.",
        };
      }
      if (response.status === 503) {
        throw { status: 503, message: "Model is loading, please retry." };
      }

      throw new Error(
        `API error: ${response.status} - ${errorText.slice(0, 100)}`,
      );
    }

    const data = await response.json();

    // OpenAI-compatible response format
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      return content.trim();
    }

    throw new Error("No content in response");
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw { status: 408, message: "Request timed out" };
    }
    throw error;
  }
}

// Call LLM with fallback
async function callLLM(
  token: string,
  selectedModel: string,
  messages: Array<{ role: string; content: string }>,
): Promise<{ text: string; model: string }> {
  const primaryModelId = MODELS[selectedModel] || MODELS["mistral-7b"];
  const fallbackModelId =
    selectedModel === "llama-3" ? MODELS["mistral-7b"] : MODELS["llama-3"];

  // Try primary model
  try {
    const text = await callHuggingFace(token, primaryModelId, messages);
    return { text, model: selectedModel };
  } catch (error: any) {
    console.warn(`Primary model (${selectedModel}) failed:`, error.message);
  }

  // Try fallback model
  const fallbackName = selectedModel === "llama-3" ? "mistral-7b" : "llama-3";
  console.log(`Falling back to ${fallbackName}...`);

  try {
    const text = await callHuggingFace(token, fallbackModelId, messages);
    return { text, model: fallbackName };
  } catch (error: any) {
    console.error(`Fallback model also failed:`, error.message);
    throw new Error(`All models failed. Last error: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      prompt,
      model = "mistral-7b",
      type = "tweet",
      userIdentity,
      guidelines,
      count = 1,
      tone = "professional",
      chatHistory = [],
    } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const postCount = Math.min(Math.max(1, parseInt(count) || 1), 35);
    const isChat = type === "chat";

    // Get Hugging Face Token
    const HF_TOKEN = Deno.env.get("HUGGINGFACE_TOKEN");

    if (!HF_TOKEN) {
      console.error("HUGGINGFACE_TOKEN is not configured");
      return new Response(
        JSON.stringify({
          error:
            "AI service not configured. Please add HUGGINGFACE_TOKEN to Supabase secrets.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get model display name for Plingo branding
    const modelName = MODEL_NAMES[model] || "Nova";

    // Build the system prompt with Plingo character
    const currentDateTime = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "UTC",
    });

    let systemPrompt = getPlingoAgentCharacter(tone, modelName) + "\n\n";
    systemPrompt += `CURRENT REAL-WORLD CONTEXT:\nToday's Date: ${currentDateTime} (UTC)\n\n`;

    if (userIdentity) {
      systemPrompt += `About the user you're helping:\n${userIdentity}\n\n`;
    }

    // Build task-specific instructions
    let taskPrompt = prompt;
    if (isChat) {
      systemPrompt += `Respond naturally and conversationally to the user's message while following all your rules above. Remember the context of previous messages in this conversation.`;
    } else {
      switch (type) {
        case "tweet":
          if (postCount > 1) {
            systemPrompt += `Generate ${postCount} different engaging tweet variations.
Each tweet should be under 280 characters. Make them engaging, use appropriate hashtags sparingly (1-2 max).
Return EXACTLY ${postCount} tweets, each on a new line, numbered (1., 2., etc). No extra explanations.`;
          } else {
            systemPrompt += `Generate engaging tweet content. 
Keep it under 280 characters. Make it engaging, use appropriate hashtags sparingly (1-2 max).
Return ONLY the tweet text, no explanations or quotes around it.`;
          }
          break;
        case "thread":
          systemPrompt += `Generate a Twitter thread (3-5 tweets).
Each tweet should be under 280 characters. Make them engaging and connected.
Return each tweet on a new line, numbered (1/, 2/, etc). No extra explanations.`;
          break;
        default:
          if (postCount > 1) {
            systemPrompt += `Generate ${postCount} different content variations.
Each should be concise and suitable for social media.
Return EXACTLY ${postCount} items, each on a new line, numbered (1., 2., etc). No extra explanations.`;
          } else {
            systemPrompt += `Generate content based on the user's request.
Keep responses concise and suitable for social media.`;
          }
      }
    }

    if (guidelines) {
      systemPrompt += `\n\nAdditional user guidelines to follow:\n${guidelines}`;
    }

    // Build messages with chat history
    const messages = buildMessages(
      systemPrompt,
      chatHistory as ChatMessage[],
      taskPrompt,
    );

    console.log(
      `Generating content with model: ${model}, type: ${type}, history: ${chatHistory.length} messages`,
    );

    const { text: generatedText, model: usedModel } = await callLLM(
      HF_TOKEN,
      model,
      messages,
    );

    if (!generatedText) {
      return new Response(
        JSON.stringify({
          error: "No content was generated. Please try again.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const cleanedText = stripMarkdown(generatedText);

    let result;
    if (isChat) {
      result = cleanedText;
    } else if (type === "thread" || postCount > 1) {
      result = cleanedText
        .split("\n")
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^\d+[\/\.\)\]]\s*/, "").trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => stripMarkdown(line));
    } else {
      result = cleanedText;
    }

    console.log(`Content generated successfully using ${usedModel}`);

    return new Response(
      JSON.stringify({ content: result, model: usedModel, type }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Error in generate-content function:", error);

    const status = error.status || 500;
    const message = error.message || "Unknown error occurred";

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
