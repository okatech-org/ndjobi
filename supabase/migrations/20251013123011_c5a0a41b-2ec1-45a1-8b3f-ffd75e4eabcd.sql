-- Table des paramètres utilisateur (notifications, confidentialité, préférences)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Notifications
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  sms_notifications BOOLEAN NOT NULL DEFAULT FALSE,
  push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  report_updates BOOLEAN NOT NULL DEFAULT TRUE,
  project_updates BOOLEAN NOT NULL DEFAULT TRUE,
  security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  -- Confidentialité
  profile_visibility TEXT NOT NULL DEFAULT 'private', -- 'private' | 'agents' | 'public'
  show_email BOOLEAN NOT NULL DEFAULT FALSE,
  show_phone BOOLEAN NOT NULL DEFAULT FALSE,
  anonymous_reports BOOLEAN NOT NULL DEFAULT TRUE,
  -- Préférences
  language TEXT NOT NULL DEFAULT 'fr',
  theme TEXT NOT NULL DEFAULT 'system', -- 'light' | 'dark' | 'system'
  timezone TEXT NOT NULL DEFAULT 'Africa/Libreville',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Politiques: lecture/écriture par le propriétaire
CREATE POLICY "Users can view their own settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Trigger updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

