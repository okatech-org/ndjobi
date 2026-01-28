-- Create storage bucket for anonymous report attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('anonymous-reports', 'anonymous-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload files to anonymous-reports bucket
CREATE POLICY "Anyone can upload anonymous report files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'anonymous-reports');

-- Allow anyone to view anonymous report files (public bucket)
CREATE POLICY "Anyone can view anonymous report files"
ON storage.objects FOR SELECT
USING (bucket_id = 'anonymous-reports');