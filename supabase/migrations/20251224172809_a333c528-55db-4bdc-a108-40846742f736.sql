-- ============================================
-- PLINGO BACKEND SCHEMA
-- Complete multi-user social media automation
-- ============================================

-- 1. Create ENUM types
CREATE TYPE public.platform_type AS ENUM ('twitter', 'instagram', 'linkedin', 'facebook', 'threads', 'tiktok', 'youtube', 'pinterest');
CREATE TYPE public.post_status AS ENUM ('draft', 'scheduled', 'posting', 'posted', 'failed');
CREATE TYPE public.schedule_type AS ENUM ('daily', 'weekdays', 'weekends', 'custom');
CREATE TYPE public.platform_connection_status AS ENUM ('connected', 'expired', 'revoked', 'error');
CREATE TYPE public.job_status AS ENUM ('scheduled', 'executed', 'failed', 'cancelled');

-- 2. Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Connected platforms table (OAuth tokens per user)
CREATE TABLE public.connected_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform platform_type NOT NULL,
  platform_account_id TEXT NOT NULL,
  platform_username TEXT,
  platform_display_name TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  access_token_hash TEXT NOT NULL,
  refresh_token_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  status platform_connection_status DEFAULT 'connected' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, platform, platform_account_id)
);

-- 4. Posts table (editor cards)
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  platforms platform_type[] DEFAULT '{}',
  status post_status DEFAULT 'draft' NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  media_urls TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. Schedule rules table (alarm-style scheduling)
CREATE TABLE public.schedule_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  type schedule_type NOT NULL,
  days TEXT[] DEFAULT '{}',
  time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 6. Post schedules table (links posts to rules and QStash jobs)
CREATE TABLE public.post_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  rule_id UUID REFERENCES public.schedule_rules(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  qstash_message_id TEXT,
  status job_status DEFAULT 'scheduled' NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 7. Post logs table (audit trail)
CREATE TABLE public.post_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  platform platform_type,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - All user-scoped
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Connected platforms policies (CRITICAL: tokens never exposed to client)
CREATE POLICY "Users can view their own platforms" 
  ON public.connected_platforms FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own platforms" 
  ON public.connected_platforms FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platforms" 
  ON public.connected_platforms FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platforms" 
  ON public.connected_platforms FOR DELETE 
  USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view their own posts" 
  ON public.posts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" 
  ON public.posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.posts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.posts FOR DELETE 
  USING (auth.uid() = user_id);

-- Schedule rules policies
CREATE POLICY "Users can view their own schedule rules" 
  ON public.schedule_rules FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedule rules" 
  ON public.schedule_rules FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedule rules" 
  ON public.schedule_rules FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedule rules" 
  ON public.schedule_rules FOR DELETE 
  USING (auth.uid() = user_id);

-- Post schedules policies
CREATE POLICY "Users can view their own post schedules" 
  ON public.post_schedules FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_schedules.post_id 
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own post schedules" 
  ON public.post_schedules FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_schedules.post_id 
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own post schedules" 
  ON public.post_schedules FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_schedules.post_id 
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own post schedules" 
  ON public.post_schedules FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_schedules.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- Post logs policies
CREATE POLICY "Users can view their own post logs" 
  ON public.post_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_logs.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS AND FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_connected_platforms_updated_at
  BEFORE UPDATE ON public.connected_platforms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedule_rules_updated_at
  BEFORE UPDATE ON public.schedule_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_schedules_updated_at
  BEFORE UPDATE ON public.post_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_scheduled_at ON public.posts(scheduled_at);
CREATE INDEX idx_connected_platforms_user_id ON public.connected_platforms(user_id);
CREATE INDEX idx_post_schedules_scheduled_at ON public.post_schedules(scheduled_at);
CREATE INDEX idx_post_schedules_status ON public.post_schedules(status);