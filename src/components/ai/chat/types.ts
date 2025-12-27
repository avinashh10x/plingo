export interface GeneratedPost {
  id: string;
  content: string;
  isUserMessage?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIModel {
  id: string;
  name: string;
  shortName: string;
  description: string;
  badge: 'Recommended' | 'Pro' | null;
}

export const AI_MODELS: AIModel[] = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.5 Flash', shortName: 'Gemini 2.5', description: 'Fast & efficient', badge: 'Recommended' },
  { id: 'gemini-1.5-flash', name: 'Gemini 2.5 Flash Lite', shortName: 'Gemini Lite', description: 'Fastest, lightweight', badge: null },
  { id: 'gemini-1.5-pro', name: 'Gemini 2.5 Pro', shortName: 'Gemini Pro', description: 'Most powerful', badge: 'Pro' },
];
