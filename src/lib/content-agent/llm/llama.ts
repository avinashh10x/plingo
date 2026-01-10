/**
 * Meta Llama 3 Client
 * Fallback LLM for content generation via Hugging Face Inference API
 */

import type { LLMConfig } from "../types";

const LLAMA_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";
const HF_API_URL = "https://router.huggingface.co/hf-inference/models";

export async function callLlama(
  prompt: string,
  config: LLMConfig
): Promise<string> {
  const { huggingFaceToken, timeout = 30000 } = config;

  if (!huggingFaceToken) {
    throw new Error("Hugging Face token is required");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${HF_API_URL}/${LLAMA_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${huggingFaceToken}`,
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

      if (response.status === 429) {
        throw new Error("RATE_LIMIT: Llama rate limit exceeded");
      }
      if (response.status === 503) {
        throw new Error("MODEL_LOADING: Llama model is loading, please retry");
      }

      throw new Error(
        `Llama API error: ${response.status} - ${
          errorData.error || "Unknown error"
        }`
      );
    }

    const data = await response.json();

    // Handle response format
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.trim();
    }

    if (typeof data === "string") {
      return data.trim();
    }

    throw new Error("Unexpected response format from Llama");
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error("TIMEOUT: Llama request timed out");
    }

    throw error;
  }
}
