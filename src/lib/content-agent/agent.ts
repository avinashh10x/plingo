/**
 * Content Agent Core
 * Main logic for AI-powered content generation
 */

import type {
  AgentRequest,
  AgentResponse,
  AgentConfig,
  PromptContext,
} from "./types";
import { buildFullPrompt } from "./prompt-builder";
import { callLLM } from "./llm";
import { validateRequest } from "./validation";

/**
 * Generate content using the AI agent
 *
 * @example
 * ```ts
 * const response = await generateContent({
 *   domain: 'tech',
 *   persona: 'senior frontend developer',
 *   tone: 'opinionated',
 *   contentType: 'tweet',
 *   signals: [
 *     { title: 'React 19 Released', summary: 'New concurrent features...', source: 'hn' }
 *   ],
 *   count: 3
 * }, { huggingFaceToken: 'hf_xxx' });
 * ```
 */
export async function generateContent(
  request: AgentRequest,
  config: AgentConfig
): Promise<AgentResponse> {
  const startTime = Date.now();

  // 1. Validate input
  const validation = validateRequest(request);
  if (!validation.valid) {
    return {
      success: false,
      content: [],
      model: "unknown",
      signalsUsed: 0,
      latencyMs: Date.now() - startTime,
      error: validation.errors.join("; "),
    };
  }

  // 2. Prepare context
  const context: PromptContext = {
    domain: request.domain,
    persona: request.persona,
    tone: request.tone,
    signals: request.signals.slice(0, 7), // Cap at 7
    contentType: request.contentType,
    count: request.count || 1,
    customInstructions: request.customInstructions,
  };

  // 3. Build prompt
  let prompt: string;
  try {
    prompt = buildFullPrompt(context);
  } catch (error: any) {
    return {
      success: false,
      content: [],
      model: "unknown",
      signalsUsed: 0,
      latencyMs: Date.now() - startTime,
      error: `Prompt build failed: ${error.message}`,
    };
  }

  if (config.debug) {
    console.log("[ContentAgent] Prompt:", prompt);
  }

  // 4. Call LLM
  try {
    const llmResponse = await callLLM(prompt, config);

    // 5. Parse response
    const content = parseGeneratedContent(llmResponse.text, context.count);

    return {
      success: true,
      content,
      model: llmResponse.model,
      signalsUsed: context.signals.length,
      latencyMs: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      content: [],
      model: "unknown",
      signalsUsed: 0,
      latencyMs: Date.now() - startTime,
      error: error.message,
    };
  }
}

/**
 * Parse LLM output into individual content pieces
 */
function parseGeneratedContent(text: string, expectedCount: number): string[] {
  // Clean up the text
  let cleaned = text
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
    .replace(/\*([^*]+)\*/g, "$1") // Remove italic
    .trim();

  if (expectedCount === 1) {
    return [cleaned];
  }

  // Try to split by numbered items
  const numberedPattern = /(?:^|\n)\s*(?:\d+[\.\)\/:]\s*)/;
  const parts = cleaned
    .split(numberedPattern)
    .filter((p) => p.trim().length > 0);

  if (parts.length >= expectedCount) {
    return parts.slice(0, expectedCount).map((p) => p.trim());
  }

  // Fallback: split by double newlines
  const byNewlines = cleaned.split(/\n\n+/).filter((p) => p.trim().length > 0);

  if (byNewlines.length >= expectedCount) {
    return byNewlines.slice(0, expectedCount).map((p) => p.trim());
  }

  // Last resort: return what we have
  return byNewlines.length > 0 ? byNewlines.map((p) => p.trim()) : [cleaned];
}
