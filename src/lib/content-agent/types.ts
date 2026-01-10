/**
 * Content Agent Types
 * Reusable input/output contracts for the AI content generation agent
 */

// ==========================================
// INPUT TYPES
// ==========================================

export type Domain = "tech" | "lifestyle" | "business" | "finance" | "health";
export type Tone =
  | "professional"
  | "casual"
  | "opinionated"
  | "witty"
  | "formal";
export type ContentType = "tweet" | "thread" | "linkedin" | "post";

export interface Signal {
  title: string;
  summary: string; // Max 2 lines
  source: "hn" | "github" | "reddit" | "custom";
  score?: number;
  url?: string;
}

export interface AgentRequest {
  domain: Domain;
  persona: string; // e.g., "senior frontend developer"
  tone: Tone;
  signals: Signal[]; // Max 5-7 signals
  contentType: ContentType;
  count?: number; // Number of variations (default: 1)
  customInstructions?: string;
}

// ==========================================
// OUTPUT TYPES
// ==========================================

export interface AgentResponse {
  success: boolean;
  content: string[];
  model: "mistral-7b" | "llama-3" | "unknown";
  signalsUsed: number;
  latencyMs: number;
  error?: string;
}

// ==========================================
// CONFIG TYPES
// ==========================================

export interface LLMConfig {
  huggingFaceToken: string;
  primaryModel?: string;
  fallbackModel?: string;
  timeout?: number; // Default: 30000ms
  maxRetries?: number; // Default: 2
}

export interface AgentConfig extends LLMConfig {
  debug?: boolean;
}

// ==========================================
// INTERNAL TYPES
// ==========================================

export interface LLMResponse {
  text: string;
  model: "mistral-7b" | "llama-3";
}

export interface PromptContext {
  domain: Domain;
  persona: string;
  tone: Tone;
  signals: Signal[];
  contentType: ContentType;
  count: number;
  customInstructions?: string;
}
