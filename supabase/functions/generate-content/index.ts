import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Free Google Gemini Models - Verified current model IDs
// Get your API key at: https://aistudio.google.com/app/apikey
const GEMINI_MODELS: Record<string, string> = {
  "gemini-2.0-flash": "gemini-2.5-flash", // Latest 2.5 flash
  "gemini-1.5-flash": "gemini-2.5-flash", // Map to 2.5 flash
  "gemini-1.5-flash-8b": "gemini-2.5-flash", // Use 2.5 flash
};

// Buggy AI Agent Character - Content Writer Specialist
const getBuggyAgentCharacter = (tone: string) => {
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

  return `You are Buggy — a content writing specialist who knows how to craft engaging social media posts.

CURRENT TONE: ${tone.toUpperCase()}
${toneGuide}

Goal:
Write compelling, scroll-stopping content that gets engagement. You understand what makes people click, share, and comment.

WRITING RULES:
- Match the requested tone exactly — this is your personality for this conversation
- Write like a human, not a robot
- No filler phrases like "Behold," "Let's dive in," "Here's the thing"
- No cringe motivational quotes unless that's the tone requested
- Be concise — every word should earn its place
- Never use markdown formatting. Return plain text only.

CONTENT QUALITY:
- Hook readers in the first line
- Make it relevant and CURRENT — reference recent trends, events, or timely topics when applicable
- Research-minded: provide info that feels fresh and up-to-date
- Based on real trends, not made-up facts
- No fake statistics or hallucinated data
- If the topic is time-sensitive, acknowledge current context
- Platform-aware:
  - Twitter/X → max 280 chars
  - LinkedIn → professional narrative
  - Instagram → caption-friendly
- Hashtags: relevant & limited (1-2 max)

MULTIPLE POSTS:
When asked for multiple posts:
- Each must feel distinct, not just rephrased
- Vary the angle, hook, or format
- Different CTA approaches

OUTPUT STYLE:
Short, punchy, effective. No emojis unless it fits the tone.`;
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

// Call Google Gemini API directly
async function callGeminiAPI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
) {
  const modelId = GEMINI_MODELS[model] || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  console.log("Calling Gemini API:", {
    model,
    modelId,
    promptLength: userPrompt.length,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData?.error?.message || `API error: ${response.status}`;
    console.error(
      "Gemini API error:",
      response.status,
      JSON.stringify(errorData)
    );

    if (response.status === 429) {
      throw {
        status: 429,
        message: "Rate limit exceeded. Please wait a moment and try again.",
      };
    }
    if (response.status === 400) {
      throw {
        status: 400,
        message: `Bad request: ${errorMessage}`,
      };
    }
    if (response.status === 403) {
      throw {
        status: 403,
        message: "API key doesn't have access to this model or feature.",
      };
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  // Check for content filtering blocks
  if (data.candidates?.[0]?.finishReason === "SAFETY") {
    throw new Error(
      "Content was blocked by safety filters. Please try rephrasing your request."
    );
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      prompt,
      model = "gemini-2.0-flash",
      type = "tweet",
      userIdentity,
      guidelines,
      count = 1,
      tone = "professional",
    } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const postCount = Math.min(Math.max(1, parseInt(count) || 1), 10);
    const isChat = type === "chat";

    // Get Google AI API Key
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

    console.log("API Key check:", {
      hasKey: !!GOOGLE_AI_API_KEY,
      keyLength: GOOGLE_AI_API_KEY?.length || 0,
      keyPrefix: GOOGLE_AI_API_KEY?.substring(0, 8) || "none",
    });

    if (!GOOGLE_AI_API_KEY) {
      console.error("GOOGLE_AI_API_KEY is not configured in Supabase secrets");
      return new Response(
        JSON.stringify({
          error:
            "AI service not configured. Please add GOOGLE_AI_API_KEY to Supabase Edge Function Secrets.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate API key format (Google AI keys start with "AIza")
    if (!GOOGLE_AI_API_KEY.startsWith("AIza")) {
      console.error("Invalid API key format - should start with AIza");
      return new Response(
        JSON.stringify({
          error:
            'Invalid API key format. Google AI API keys should start with "AIza..."',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build the system prompt with Buggy character (tone-aware)
    let systemPrompt = getBuggyAgentCharacter(tone) + "\n\n";

    // Add user identity context if provided
    if (userIdentity) {
      systemPrompt += `About the user you're helping:\n${userIdentity}\n\n`;
    }

    // Add task-specific instructions
    if (isChat) {
      systemPrompt += `Respond naturally and conversationally to the user's message while following all your rules above.`;
    } else {
      switch (type) {
        case "tweet":
          if (postCount > 1) {
            systemPrompt += `Generate ${postCount} different engaging tweet variations based on the user's prompt.
Each tweet should be under 280 characters. Make them engaging, use appropriate hashtags sparingly (1-2 max).
Return EXACTLY ${postCount} tweets, each on a new line, numbered (1., 2., etc). No extra explanations.`;
          } else {
            systemPrompt += `Generate engaging tweet content based on the user's prompt. 
Keep it under 280 characters. Make it engaging, use appropriate hashtags sparingly (1-2 max).
Return ONLY the tweet text, no explanations or quotes around it.`;
          }
          break;
        case "thread":
          systemPrompt += `Generate a Twitter thread (3-5 tweets) based on the user's prompt.
Each tweet should be under 280 characters. Make them engaging and connected.
Return each tweet on a new line, numbered (1/, 2/, etc). No extra explanations.`;
          break;
        case "rephrase":
          systemPrompt += `Rephrase the given content to be more engaging for social media.
Keep the core message but make it more compelling. Keep it under 280 characters.
Return ONLY the rephrased text, no explanations.`;
          break;
        case "hashtags":
          systemPrompt += `Suggest 5-7 relevant hashtags for the given content.
Return only the hashtags, space-separated, starting with #.`;
          break;
        default:
          if (postCount > 1) {
            systemPrompt += `Generate ${postCount} different content variations based on the user's request.
Each should be concise and suitable for social media.
Return EXACTLY ${postCount} items, each on a new line, numbered (1., 2., etc). No extra explanations.`;
          } else {
            systemPrompt += `Generate content based on the user's request.
Keep responses concise and suitable for social media.`;
          }
      }
    }

    // Add user's additional guidelines
    if (guidelines) {
      systemPrompt += `\n\nAdditional user guidelines to follow:\n${guidelines}`;
    }

    console.log(
      `Generating content with Google Gemini, model: ${model}, type: ${type}, isChat: ${isChat}`
    );

    let generatedText: string;

    try {
      generatedText = await callGeminiAPI(
        GOOGLE_AI_API_KEY,
        model,
        systemPrompt,
        prompt
      );
    } catch (error: any) {
      if (error.status === 429) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (error.status === 400) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw error;
    }

    if (!generatedText) {
      console.error("No content generated");
      return new Response(
        JSON.stringify({
          error: "No content was generated. Please try again.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Strip markdown from all responses
    const cleanedText = stripMarkdown(generatedText);

    let result;
    if (isChat) {
      result = cleanedText;
    } else if (type === "thread" || postCount > 1) {
      result = cleanedText
        .split("\n")
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^\d+[\/\.)\]]\s*/, "").trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => stripMarkdown(line));
    } else {
      result = cleanedText;
    }

    console.log(`Content generated successfully for type: ${type}`);

    return new Response(JSON.stringify({ content: result, model, type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-content function:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
