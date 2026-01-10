/**
 * Content Agent - Main Export
 *
 * A modular, reusable AI content generation agent that generates
 * trend-aware social media content using externally supplied signals.
 *
 * @example
 * ```ts
 * import { generateContent, type AgentRequest } from '@/lib/content-agent';
 *
 * const response = await generateContent({
 *   domain: 'tech',
 *   persona: 'senior frontend developer',
 *   tone: 'opinionated',
 *   contentType: 'tweet',
 *   signals: [
 *     { title: 'React 19 Released', summary: '...', source: 'hn' }
 *   ]
 * }, { huggingFaceToken: process.env.HF_TOKEN });
 * ```
 */

// Main function
export { generateContent } from "./agent";

// Types
export type {
  // Input types
  AgentRequest,
  Signal,
  Domain,
  Tone,
  ContentType,

  // Output types
  AgentResponse,

  // Config types
  AgentConfig,
  LLMConfig,

  // Internal types (for advanced usage)
  PromptContext,
  LLMResponse,
} from "./types";

// Utilities (for advanced usage)
export {
  buildSystemPrompt,
  buildUserPrompt,
  buildFullPrompt,
} from "./prompt-builder";

export { validateRequest, type ValidationResult } from "./validation";

// LLM clients (for direct usage if needed)
export { callLLM, callMistral, callLlama } from "./llm";

// Signal fetchers (for background jobs)
export {
  fetchHackerNewsSignals,
  fetchGitHubTrendingSignals,
  fetchAllSignals,
  type FetchAllOptions,
} from "./fetchers";
