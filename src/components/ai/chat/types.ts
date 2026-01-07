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
  badge: "Fast" | "Recommended" | "Lite" | null;
}

// Free Google Gemini Models
// API Key: https://aistudio.google.com/app/apikey
export const AI_MODELS: AIModel[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    shortName: "Flash 2.5",
    description: "Best choice (Recommended)",
    badge: "Recommended",
  },
];
