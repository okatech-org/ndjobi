-- Create table for tracking PIN verification attempts (rate limiting)
CREATE TABLE IF NOT EXISTS public.pin_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  attempt_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  successful BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT
);

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_pin_attempts_phone_time 
ON public.pin_attempts(phone, attempt_time DESC);

-- Add index for cleanup
CREATE INDEX IF NOT EXISTS idx_pin_attempts_time 
ON public.pin_attempts(attempt_time);

-- Enable RLS
ALTER TABLE public.pin_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can access (this is internal security table)
CREATE POLICY "Service role can manage pin attempts"
ON public.pin_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to clean up old attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_pin_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.pin_attempts
  WHERE attempt_time < now() - interval '24 hours';
END;
$$;