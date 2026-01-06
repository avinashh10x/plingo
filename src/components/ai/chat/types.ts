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
    name: "Gemini 2.5 Flash",
    shortName: "Gemini 2.5",
    description: "Latest & smartest",
    badge: "Recommended",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 2.5 Flash",
    shortName: "Flash",
    description: "Fast & balanced",
    badge: "Fast",
  },
  {
    id: "gemini-1.5-flash-8b",
    name: "Gemini 2.5 Flash",
    shortName: "Lite",
    description: "Quick responses",
    badge: "Lite",
  },
];
