-- Create user_usage table to track monthly post usage
CREATE TABLE public.user_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform platform_type NOT NULL,
  month_year TEXT NOT NULL, -- Format: YYYY-MM
  posts_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, month_year)
);

-- Enable Row Level Security
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own usage" 
ON public.user_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" 
ON public.user_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
ON public.user_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_usage_updated_at
BEFORE UPDATE ON public.user_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_user_usage_lookup ON public.user_usage(user_id, platform, month_year);