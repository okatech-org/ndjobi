-- Table pour stocker les codes PIN des utilisateurs
CREATE TABLE IF NOT EXISTS public.user_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own PIN
CREATE POLICY "Users can view their own PIN"
  ON public.user_pins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PIN"
  ON public.user_pins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PIN"
  ON public.user_pins
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_user_pins_updated_at
  BEFORE UPDATE ON public.user_pins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();