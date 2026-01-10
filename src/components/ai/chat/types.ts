export interface GeneratedPost {
  id: string;
  content: string;
  isUserMessage?: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIModel {
  id: string;
  name: string;
  shortName: string;
  description: string;
  badge: "Fast" | "Creative" | "Balanced" | null;
  icon?: string;
}

// Open Source Models via Hugging Face
// Primary: Mistral 7B, Fallback: Llama 3
export const AI_MODELS: AIModel[] = [
  {
    id: "mistral-7b",
    name: "Nova",
    shortName: "Nova",
    description: "Fast & precise",
    badge: "Fast",
    icon: "⚡",
  },
  {
    id: "llama-3",
    name: "Sage",
    shortName: "Sage",
    description: "Creative & thoughtful",
    badge: "Creative",
    icon: "🧠",
  },
];
