-- Table pour l'historique des actions des agents
CREATE TABLE public.agent_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  signalement_id UUID REFERENCES public.signalements(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_details JSONB DEFAULT '{}'::jsonb,
  old_values JSONB DEFAULT NULL,
  new_values JSONB DEFAULT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour performances
CREATE INDEX idx_audit_agent ON public.agent_audit_logs(agent_id);
CREATE INDEX idx_audit_signalement ON public.agent_audit_logs(signalement_id);
CREATE INDEX idx_audit_action_type ON public.agent_audit_logs(action_type);
CREATE INDEX idx_audit_created_at ON public.agent_audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.agent_audit_logs ENABLE ROW LEVEL SECURITY;

-- Agents can view their own audit logs
CREATE POLICY "Agents can view their own audit logs"
ON public.agent_audit_logs FOR SELECT
USING (agent_id = auth.uid());

-- Agents can insert their own audit logs
CREATE POLICY "Agents can insert their own audit logs"
ON public.agent_audit_logs FOR INSERT
WITH CHECK (agent_id = auth.uid());

-- Super admin and president can view all audit logs
CREATE POLICY "Super admin can view all audit logs"
ON public.agent_audit_logs FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Enable realtime for audit logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_audit_logs;