-- Créer le bucket de stockage pour les conversations iAsted
INSERT INTO storage.buckets (id, name, public)
VALUES ('conversations', 'conversations', false)
ON CONFLICT (id) DO NOTHING;

-- RLS pour le bucket conversations
CREATE POLICY "Admin can upload conversation audio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'conversations' 
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
    AND (storage.foldername(name))[1] = 'iasted-audio'
  );

CREATE POLICY "Admin can read conversation audio"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'conversations'
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  );

CREATE POLICY "Admin can delete conversation audio"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'conversations'
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  );