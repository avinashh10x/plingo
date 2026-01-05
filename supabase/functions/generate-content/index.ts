import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model mappings - works for both Lovable AI Gateway and Google AI
const LOVABLE_MODELS: Record<string, string> = {
  'gemini-2.0-flash': 'google/gemini-2.5-flash',
  'gemini-1.5-flash': 'google/gemini-2.5-flash-lite',
  'gemini-1.5-pro': 'google/gemini-2.5-pro',
};

const GOOGLE_MODELS: Record<string, string> = {
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-1.5-pro': 'gemini-1.5-pro',
};

// Buggy AI Agent Character - Content Writer Specialist
// Tone is applied dynamically based on user selection
const getBuggyAgentCharacter = (tone: string) => {
  const toneInstructions: Record<string, string> = {
    professional: "Write in a polished, business-appropriate tone. Be authoritative yet approachable. Use industry terms where relevant.",
    casual: "Write like you're texting a friend. Relaxed, conversational, no stiff language. Contractions encouraged.",
    friendly: "Write with warmth and positivity. Be encouraging and supportive. Use inclusive language.",
    witty: "Be clever and playful. Add subtle humor, puns, or wordplay. Keep it smart, not cheesy.",
    formal: "Write with proper grammar and structure. No contractions. Maintain a serious, dignified tone.",
    inspirational: "Write with energy and motivation. Be uplifting and empowering. Paint a vision of success.",
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
    // Remove bold/italic markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bullet points
    .replace(/^\s*[\*\-\+]\s+/gm, '')
    // Remove numbered lists formatting (keep text)
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Call Google AI directly (for self-hosted)
async function callGoogleAI(apiKey: string, model: string, systemPrompt: string, userPrompt: string) {
  const modelId = GOOGLE_MODELS[model] || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      }
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google AI error:', response.status, errorText);
    throw new Error(`Google AI error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Call Lovable AI Gateway (for Lovable Cloud)
async function callLovableAI(apiKey: string, model: string, systemPrompt: string, userPrompt: string) {
  const modelId = LOVABLE_MODELS[model] || 'google/gemini-2.5-flash';
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI Gateway error:', response.status, errorText);
    
    if (response.status === 429) {
      throw { status: 429, message: 'Rate limit exceeded. Please wait a moment and try again.' };
    }
    if (response.status === 402) {
      throw { status: 402, message: 'AI credits exhausted. Please add credits to continue.' };
    }
    throw new Error('Failed to generate content');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      model = 'gemini-2.0-flash', 
      type = 'tweet', 
      userIdentity,
      guidelines, 
      count = 1,
      tone = 'professional'
    } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const postCount = Math.min(Math.max(1, parseInt(count) || 1), 10);
    const isChat = type === 'chat';

    // Check for API keys - prefer GOOGLE_AI_API_KEY for self-hosted, fallback to LOVABLE_API_KEY
    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const useGoogleDirect = !!GOOGLE_AI_API_KEY;
    const apiKey = GOOGLE_AI_API_KEY || LOVABLE_API_KEY;
    
    if (!apiKey) {
      console.error('No AI API key configured (GOOGLE_AI_API_KEY or LOVABLE_API_KEY)');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Build the system prompt with Buggy character (tone-aware)
    let systemPrompt = getBuggyAgentCharacter(tone) + '\n\n';
    
    // Add user identity context (who the user is) if provided
    if (userIdentity) {
      systemPrompt += `About the user you're helping:\n${userIdentity}\n\n`;
    }

    // Add task-specific instructions
    if (isChat) {
      systemPrompt += `Respond naturally and conversationally to the user's message while following all your rules above.`;
    } else {
      switch (type) {
        case 'tweet':
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
        case 'thread':
          systemPrompt += `Generate a Twitter thread (3-5 tweets) based on the user's prompt.
Each tweet should be under 280 characters. Make them engaging and connected.
Return each tweet on a new line, numbered (1/, 2/, etc). No extra explanations.`;
          break;
        case 'rephrase':
          systemPrompt += `Rephrase the given content to be more engaging for social media.
Keep the core message but make it more compelling. Keep it under 280 characters.
Return ONLY the rephrased text, no explanations.`;
          break;
        case 'hashtags':
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

    console.log(`Generating content with ${useGoogleDirect ? 'Google AI' : 'Lovable AI'}, model: ${model}, type: ${type}, isChat: ${isChat}`);

    let generatedText: string;
    
    try {
      if (useGoogleDirect) {
        generatedText = await callGoogleAI(apiKey, model, systemPrompt, prompt);
      } else {
        generatedText = await callLovableAI(apiKey, model, systemPrompt, prompt);
      }
    } catch (error: any) {
      if (error.status === 429) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (error.status === 402) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    if (!generatedText) {
      console.error('No content generated');
      return new Response(
        JSON.stringify({ error: 'No content was generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    // Strip markdown from all responses
    const cleanedText = stripMarkdown(generatedText);
    
    if (isChat) {
      // For chat, return the cleaned response
      result = cleanedText;
    } else if (type === 'thread' || postCount > 1) {
      result = cleanedText
        .split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^\d+[\/\.\)]\s*/, '').trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => stripMarkdown(line));
    } else {
      result = cleanedText;
    }

    console.log(`Content generated successfully for type: ${type}`);

    return new Response(
      JSON.stringify({ content: result, model, type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
