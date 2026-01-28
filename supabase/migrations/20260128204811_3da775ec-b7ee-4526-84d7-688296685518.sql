-- Create signalement_comments table for anonymous communication
CREATE TABLE public.signalement_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signalement_id UUID NOT NULL REFERENCES public.signalements(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for fast lookup
CREATE INDEX idx_signalement_comments_signalement ON public.signalement_comments(signalement_id);
CREATE INDEX idx_signalement_comments_created ON public.signalement_comments(created_at DESC);

-- Enable RLS
ALTER TABLE public.signalement_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view comments for signalements they can access by reference
CREATE POLICY "Anyone can view comments via reference lookup"
ON public.signalement_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.signalements s
    WHERE s.id = signalement_id
    AND s.reference_number IS NOT NULL
  )
);

-- Allow anyone to insert non-admin comments (for anonymous reporters)
CREATE POLICY "Anyone can add anonymous comments"
ON public.signalement_comments FOR INSERT
WITH CHECK (is_admin = false AND admin_id IS NULL);

-- Allow admins to insert admin comments
CREATE POLICY "Admins can add admin comments"
ON public.signalement_comments FOR INSERT
WITH CHECK (
  is_admin = true 
  AND admin_id = auth.uid()
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'agent'::app_role)
  )
);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.signalement_comments;