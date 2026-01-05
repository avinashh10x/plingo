-- Create table for AI chat history (max 3 per user)
CREATE TABLE public.ai_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for agent guidelines/character settings
CREATE TABLE public.agent_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  guidelines TEXT,
  character_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_chats
CREATE POLICY "Users can view their own chats" 
ON public.ai_chats FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats" 
ON public.ai_chats FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" 
ON public.ai_chats FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" 
ON public.ai_chats FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for agent_settings
CREATE POLICY "Users can view their own settings" 
ON public.agent_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
ON public.agent_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.agent_settings FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at on ai_chats
CREATE TRIGGER update_ai_chats_updated_at
BEFORE UPDATE ON public.ai_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on agent_settings
CREATE TRIGGER update_agent_settings_updated_at
BEFORE UPDATE ON public.agent_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();