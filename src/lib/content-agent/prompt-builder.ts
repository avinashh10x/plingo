/**
 * Prompt Builder
 * Constructs optimized prompts for the content generation agent
 */

import type { PromptContext, Signal } from "./types";

// ==========================================
// TONE INSTRUCTIONS
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

// ==========================================
// CONTENT TYPE INSTRUCTIONS
// ==========================================

const CONTENT_INSTRUCTIONS: Record<string, string> = {
  tweet:
    "Write a tweet under 280 characters. Hook readers instantly. 1-2 hashtags max.",
  thread:
    "Write a Twitter thread (3-5 tweets). Each under 280 chars. Connected narrative.",
  linkedin:
    "Write a LinkedIn post. Professional but engaging. Can be longer (1000 chars).",
  post: "Write a social media post. Concise, engaging, platform-flexible.",
};

// ==========================================
// PROMPT BUILDER
// ==========================================

export function buildSystemPrompt(context: PromptContext): string {
  const { domain, persona, tone, contentType, customInstructions } = context;

  const toneGuide = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.professional;
  const contentGuide =
    CONTENT_INSTRUCTIONS[contentType] || CONTENT_INSTRUCTIONS.post;

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
  customInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${customInstructions}` : ""
}`;
}

export function buildUserPrompt(context: PromptContext): string {
  const { signals, contentType, count } = context;

  if (!signals || signals.length === 0) {
    throw new Error(
      "No signals provided - cannot generate content without context"
    );
  }

  const signalsList = signals
    .slice(0, 7) // Cap at 7 signals
    .map(
      (s, i) =>
        `${i + 1}. [${s.source.toUpperCase()}] ${s.title}\n   ${s.summary}`
    )
    .join("\n\n");

  let instruction = "";
  if (count > 1) {
    instruction = `Generate ${count} different ${contentType} variations. Each should take a unique angle or perspective. Number them 1 through ${count}.`;
  } else {
    instruction = `Generate a single ${contentType} that references or comments on one or more of these signals.`;
  }

  return `CURRENT SIGNALS (use these as your ONLY source of information):

${signalsList}

TASK:
${instruction}

Remember: Be authentic to your persona. Write content that would actually get engagement.`;
}

export function buildFullPrompt(context: PromptContext): string {
  const systemPrompt = buildSystemPrompt(context);
  const userPrompt = buildUserPrompt(context);
  return `${systemPrompt}\n\n---\n\n${userPrompt}`;
}
