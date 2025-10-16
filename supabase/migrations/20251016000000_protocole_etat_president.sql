-- Migration pour le compte Protocole d'État (Président)
-- Date: 2025-10-16
-- Description: Amélioration des policies RLS et tables pour le rôle admin (Président)

-- 1. Créer la table pour les investigations et rapports
CREATE TABLE IF NOT EXISTS public.investigations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    signalement_id uuid REFERENCES public.signalements(id) ON DELETE CASCADE,
    assigned_agent_id uuid REFERENCES public.profiles(id),
    status text DEFAULT 'pending',
    priority_score integer DEFAULT 0,
    credibility_score integer DEFAULT 0,
    ai_analysis jsonb,
    assigned_at timestamp with time zone,
    assigned_by uuid REFERENCES public.profiles(id),
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    notes text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.investigation_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    investigation_id uuid REFERENCES public.investigations(id) ON DELETE CASCADE,
    report_type text NOT NULL,
    content text NOT NULL,
    findings jsonb,
    recommendations text,
    generated_by uuid REFERENCES public.profiles(id),
    generated_at timestamp with time zone DEFAULT now(),
    approved_by uuid REFERENCES public.profiles(id),
    approved_at timestamp with time zone,
    status text DEFAULT 'draft',
    attachments jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Créer la table pour l'historique d'audit du Président
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id uuid REFERENCES public.profiles(id),
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    details jsonb,
    ip_address inet,
    user_agent text,
    timestamp timestamp with time zone DEFAULT now()
);

-- 3. Ajouter des colonnes pour le scoring IA dans signalements
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'ai_priority_score'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN ai_priority_score integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'ai_credibility_score'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN ai_credibility_score integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'ai_analysis'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN ai_analysis jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'corruption_category'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN corruption_category text;
    END IF;
END $$;

-- 4. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_investigations_signalement_id ON public.investigations(signalement_id);
CREATE INDEX IF NOT EXISTS idx_investigations_assigned_agent ON public.investigations(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_investigations_status ON public.investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigation_reports_investigation_id ON public.investigation_reports(investigation_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_timestamp ON public.admin_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_signalements_ai_priority_score ON public.signalements(ai_priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_signalements_ai_credibility_score ON public.signalements(ai_credibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_signalements_corruption_category ON public.signalements(corruption_category);

-- 5. Activer RLS sur les nouvelles tables
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- 6. Créer les policies RLS pour admin (Président)
-- Les admins peuvent tout voir et modifier
DROP POLICY IF EXISTS "Admin can view all investigations" ON public.investigations;
CREATE POLICY "Admin can view all investigations" ON public.investigations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admin can manage investigations" ON public.investigations;
CREATE POLICY "Admin can manage investigations" ON public.investigations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Agents can view their investigations" ON public.investigations;
CREATE POLICY "Agents can view their investigations" ON public.investigations
    FOR SELECT USING (
        assigned_agent_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admin can view all reports" ON public.investigation_reports;
CREATE POLICY "Admin can view all reports" ON public.investigation_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admin can manage reports" ON public.investigation_reports;
CREATE POLICY "Admin can manage reports" ON public.investigation_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admin can view audit log" ON public.admin_audit_log;
CREATE POLICY "Admin can view audit log" ON public.admin_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "System can insert audit log" ON public.admin_audit_log;
CREATE POLICY "System can insert audit log" ON public.admin_audit_log
    FOR INSERT WITH CHECK (true);

-- 7. Améliorer les policies existantes pour admin
DROP POLICY IF EXISTS "Admin can view all signalements" ON public.signalements;
CREATE POLICY "Admin can view all signalements" ON public.signalements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent')
        )
    );

DROP POLICY IF EXISTS "Admin can update all signalements" ON public.signalements;
CREATE POLICY "Admin can update all signalements" ON public.signalements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent')
        )
    );

DROP POLICY IF EXISTS "Admin can view all projets" ON public.projets;
CREATE POLICY "Admin can view all projets" ON public.projets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        ) OR auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Admin can view all emergency activations" ON public.emergency_activations;
CREATE POLICY "Admin can view all emergency activations" ON public.emergency_activations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admin can manage emergency activations" ON public.emergency_activations;
CREATE POLICY "Admin can manage emergency activations" ON public.emergency_activations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- 8. Créer des vues pour les statistiques du Président
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.signalements) as total_signalements,
    (SELECT COUNT(*) FROM public.signalements WHERE status = 'pending') as pending_signalements,
    (SELECT COUNT(*) FROM public.signalements WHERE status = 'in_progress') as in_progress_signalements,
    (SELECT COUNT(*) FROM public.signalements WHERE status = 'resolved') as resolved_signalements,
    (SELECT COUNT(*) FROM public.signalements WHERE status = 'rejected') as rejected_signalements,
    (SELECT COUNT(*) FROM public.projets) as total_projets,
    (SELECT COUNT(*) FROM public.projets WHERE status = 'protected') as protected_projets,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'agent') as total_agents,
    (SELECT COUNT(*) FROM public.investigations) as total_investigations,
    (SELECT COUNT(*) FROM public.investigations WHERE status = 'in_progress') as active_investigations,
    (SELECT COUNT(*) FROM public.emergency_activations WHERE status = 'active') as active_emergencies,
    (SELECT AVG(ai_priority_score) FROM public.signalements WHERE ai_priority_score > 0) as avg_priority_score,
    (SELECT AVG(ai_credibility_score) FROM public.signalements WHERE ai_credibility_score > 0) as avg_credibility_score;

CREATE OR REPLACE VIEW public.admin_regional_stats AS
SELECT 
    location,
    COUNT(*) as total_signalements,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
    AVG(ai_priority_score) as avg_priority,
    AVG(ai_credibility_score) as avg_credibility
FROM public.signalements
WHERE location IS NOT NULL
GROUP BY location;

-- 9. Créer une fonction pour l'audit automatique
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action text,
    p_resource_type text,
    p_resource_id uuid DEFAULT NULL,
    p_details jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.admin_audit_log (admin_id, action, resource_type, resource_id, details)
    VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Créer une fonction pour obtenir les top signalements prioritaires
CREATE OR REPLACE FUNCTION public.get_top_priority_signalements(limit_count integer DEFAULT 100)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    type text,
    status text,
    priority text,
    ai_priority_score integer,
    ai_credibility_score integer,
    corruption_category text,
    location text,
    created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.description,
        s.type,
        s.status,
        s.priority,
        s.ai_priority_score,
        s.ai_credibility_score,
        s.corruption_category,
        s.location,
        s.created_at
    FROM public.signalements s
    WHERE s.status IN ('pending', 'in_progress')
    ORDER BY 
        s.ai_priority_score DESC NULLS LAST,
        s.ai_credibility_score DESC NULLS LAST,
        s.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Commentaires
COMMENT ON TABLE public.investigations IS 'Enquêtes sur les signalements avec scoring IA';
COMMENT ON TABLE public.investigation_reports IS 'Rapports d''enquête pour le Président';
COMMENT ON TABLE public.admin_audit_log IS 'Historique complet des actions du Président';
COMMENT ON COLUMN public.signalements.ai_priority_score IS 'Score de priorité IA (0-100)';
COMMENT ON COLUMN public.signalements.ai_credibility_score IS 'Score de crédibilité IA (0-100)';
COMMENT ON COLUMN public.signalements.corruption_category IS 'Catégorie: administrative, économique, détournement, fraude, abus_pouvoir';

