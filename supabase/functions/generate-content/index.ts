import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Model mappings for GOOGLE_API_KEY AI Gateway
// const MODELS: Record<string, string> = {
//   "gemini-2.0-flash": "google/gemini-2.5-flash",
//   "gemini-1.5-flash": "google/gemini-2.5-flash-lite",
//   "gemini-1.5-pro": "google/gemini-2.5-pro",
// };
const MODELS: Record<string, string> = {
  "gemini-2.0-flash": "models/gemini-1.5-flash",
  "gemini-1.5-flash": "models/gemini-1.5-flash",
  "gemini-1.5-pro": "models/gemini-1.5-pro",
};

// Global Plingo AI Agent Character - NOT editable by users
const PLINGO_AGENT_CHARACTER = `You are Plingo AI — a professional social media content strategist.

Goal:
Generate high-quality, platform-aware posts that are relevant, factual, concise, engaging, and ready to publish.

STRICT RULES:
- Do NOT use fantasy tone, storytelling magic language, or role-play.
- Do NOT use cringe motivational tone unless explicitly asked.
- No exaggerated metaphors, wizard language, poetic writing.
- No filler sentences like "Ah user," "Behold," "Let's dive in".
- Always sound like a real human professional.
- Prefer clarity > drama.
- Prefer simple readable tone.
- Never use markdown formatting (no asterisks, bullet points, headers, or special characters). Return plain text only.

CONTENT REQUIREMENTS:
- Must be relevant to the user's topic
- Must be based on real trends or logical industry updates
- Avoid fake claims
- Avoid hallucinated dates, CVEs, version numbers. If unsure, generalize.
- Keep platform in mind:
  - Twitter/X → max 280 chars unless thread mode
  - LinkedIn → professional narrative tone
  - Instagram → caption + friendly tone
- Should include CTA only when useful
- Hashtags must be relevant and limited (1-2 max)

FORMATS:
If user asks multiple posts:
- Return multiple responses separately
- Provide short variations
- Ensure each feels different, not paraphrased copy

INTERACTION STYLE:
Short, crisp, useful.
No emojis unless user asks or it makes sense.`;

// Strip markdown formatting from text
function stripMarkdown(text: string): string {
  return (
    text
      // Remove bold/italic markers
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      // Remove headers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bullet points
      .replace(/^\s*[\*\-\+]\s+/gm, "")
      // Remove numbered lists formatting (keep text)
      .replace(/^\s*\d+\.\s+/gm, "")
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Clean up extra whitespace
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
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
    } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const postCount = Math.min(Math.max(1, parseInt(count) || 1), 10);
    const isChat = type === "chat";

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build the system prompt with the fixed Plingo agent character
    let systemPrompt = PLINGO_AGENT_CHARACTER + "\n\n";

    // Add user identity context (who the user is) if provided
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

    // Add user's additional guidelines at the end
    if (guidelines) {
      systemPrompt += `\n\nAdditional user guidelines to follow:\n${guidelines}`;
    }

  const modelId = MODELS[model] || "models/gemini-1.5-flash";

    console.log(
      `Generating content with GOOGLE AI model: ${modelId}, type: ${type}, isChat: ${isChat}`
    );

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            role: "system",
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please wait a moment and try again.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Please add credits to continue.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate content" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // const data = await response.json();
    // const generatedText = data.choices?.[0]?.message?.content;

    const data = await response.json();
    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!generatedText) {
      console.error("No content generated:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No content was generated" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let result;
    // Strip markdown from all responses
    const cleanedText = stripMarkdown(generatedText);

    if (isChat) {
      // For chat, return the cleaned response
      result = cleanedText;
    } else if (type === "thread" || postCount > 1) {
      result = cleanedText
        .split("\n")
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^\d+[\/\.\)]\s*/, "").trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => stripMarkdown(line));
    } else {
      result = cleanedText;
    }

    console.log(`Content generated successfully for type: ${type}`);

    return new Response(
      JSON.stringify({ content: result, model: modelId, type }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-content function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
