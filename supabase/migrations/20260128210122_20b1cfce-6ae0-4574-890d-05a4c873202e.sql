-- Add read_at column to track when admin read the message
ALTER TABLE public.signalement_comments 
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add read_by column to track which admin read the message
ALTER TABLE public.signalement_comments 
ADD COLUMN read_by UUID DEFAULT NULL;

-- Create index for faster queries on unread messages
CREATE INDEX idx_signalement_comments_unread 
ON public.signalement_comments (signalement_id, is_admin, read_at) 
WHERE is_admin = false AND read_at IS NULL;

-- Policy to allow admins to update read status
CREATE POLICY "Admins can mark comments as read"
ON public.signalement_comments
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'agent'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'agent'::app_role)
);