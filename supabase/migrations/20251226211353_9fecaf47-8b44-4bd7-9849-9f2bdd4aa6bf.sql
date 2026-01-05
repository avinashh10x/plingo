-- Add user_identity column to store "who I am" separately from AI character
ALTER TABLE public.agent_settings 
ADD COLUMN user_identity TEXT;