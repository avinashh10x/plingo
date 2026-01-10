/**
 * Input Validation
 * Validates agent request inputs before processing
 */

import type { AgentRequest, Signal } from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_DOMAINS = ["tech", "lifestyle", "business", "finance", "health"];
const VALID_TONES = [
  "professional",
  "casual",
  "opinionated",
  "witty",
  "formal",
];
const VALID_CONTENT_TYPES = ["tweet", "thread", "linkedin", "post"];
const MAX_SIGNALS = 7;
const MIN_SIGNALS = 1;

export function validateRequest(request: AgentRequest): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!request) {
    return { valid: false, errors: ["Request is required"] };
  }

  // Domain validation
  if (!request.domain) {
    errors.push("Domain is required");
  } else if (!VALID_DOMAINS.includes(request.domain)) {
    errors.push(`Invalid domain. Must be one of: ${VALID_DOMAINS.join(", ")}`);
  }

  // Persona validation
  if (!request.persona || request.persona.trim().length === 0) {
    errors.push("Persona is required");
  } else if (request.persona.length > 200) {
    errors.push("Persona must be under 200 characters");
  }

  // Tone validation
  if (!request.tone) {
    errors.push("Tone is required");
  } else if (!VALID_TONES.includes(request.tone)) {
    errors.push(`Invalid tone. Must be one of: ${VALID_TONES.join(", ")}`);
  }

  // Content type validation
  if (!request.contentType) {
    errors.push("Content type is required");
  } else if (!VALID_CONTENT_TYPES.includes(request.contentType)) {
    errors.push(
      `Invalid content type. Must be one of: ${VALID_CONTENT_TYPES.join(", ")}`
    );
  }

  // Signals validation
  if (!request.signals || !Array.isArray(request.signals)) {
    errors.push("Signals array is required");
  } else {
    if (request.signals.length < MIN_SIGNALS) {
      errors.push(`At least ${MIN_SIGNALS} signal is required`);
    }
    if (request.signals.length > MAX_SIGNALS) {
      errors.push(`Maximum ${MAX_SIGNALS} signals allowed`);
    }

    // Validate each signal
    request.signals.forEach((signal, index) => {
      const signalErrors = validateSignal(signal, index);
      errors.push(...signalErrors);
    });
  }

  // Count validation
  if (request.count !== undefined) {
    if (
      typeof request.count !== "number" ||
      request.count < 1 ||
      request.count > 10
    ) {
      errors.push("Count must be a number between 1 and 10");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateSignal(signal: Signal, index: number): string[] {
  const errors: string[] = [];
  const prefix = `Signal ${index + 1}:`;

  if (!signal.title || signal.title.trim().length === 0) {
    errors.push(`${prefix} title is required`);
  }

  if (!signal.summary || signal.summary.trim().length === 0) {
    errors.push(`${prefix} summary is required`);
  } else if (signal.summary.length > 500) {
    errors.push(`${prefix} summary must be under 500 characters`);
  }

  if (!signal.source) {
    errors.push(`${prefix} source is required`);
  }

  return errors;
}
