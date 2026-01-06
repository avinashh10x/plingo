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
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    shortName: "Gemini 2.0",
    description: "Latest & fastest",
    badge: "Recommended",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    shortName: "Gemini 1.5",
    description: "Balanced performance",
    badge: "Fast",
  },
  {
    id: "gemini-1.5-flash-8b",
    name: "Gemini 1.5 Flash 8B",
    shortName: "Gemini Lite",
    description: "Lightweight & quick",
    badge: "Lite",
  },
];
