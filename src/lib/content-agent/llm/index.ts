/**
 * LLM Client Factory
 * Manages primary (Mistral) and fallback (Llama) model calls
 */

import type { LLMConfig, LLMResponse } from "../types";
import { callMistral } from "./mistral";
import { callLlama } from "./llama";

/**
 * Call LLM with automatic fallback
 * Primary: Mistral 7B
 * Fallback: Llama 3
 */
export async function callLLM(
  prompt: string,
  config: LLMConfig
): Promise<LLMResponse> {
  const { maxRetries = 2 } = config;

  // Try Mistral first
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const text = await callMistral(prompt, config);
      return { text, model: "mistral-7b" };
    } catch (error: any) {
      const message = error.message || "";

      // If rate limited or model loading, retry after delay
      if (message.includes("RATE_LIMIT") || message.includes("MODEL_LOADING")) {
        if (attempt < maxRetries) {
          await delay(2000 * attempt); // Exponential backoff
          continue;
        }
      }

      // Log and break to fallback
      console.warn(`Mistral attempt ${attempt} failed:`, message);
      break;
    }
  }

  // Fallback to Llama
  console.log("Falling back to Llama 3...");

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const text = await callLlama(prompt, config);
      return { text, model: "llama-3" };
    } catch (error: any) {
      const message = error.message || "";

      if (message.includes("RATE_LIMIT") || message.includes("MODEL_LOADING")) {
        if (attempt < maxRetries) {
          await delay(2000 * attempt);
          continue;
        }
      }

      console.warn(`Llama attempt ${attempt} failed:`, message);

      if (attempt === maxRetries) {
        throw new Error(`All LLM attempts failed. Last error: ${message}`);
      }
    }
  }

  throw new Error("All LLM attempts exhausted");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { callMistral } from "./mistral";
export { callLlama } from "./llama";
