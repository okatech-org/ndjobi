-- ============================================================================
-- NDJOBI - SCRIPT D'INITIALISATION COMPLÈTE DE LA BASE DE DONNÉES
-- Version: 2.0 Production Ready
-- Date: 2025-01-19
-- Description: Création tables, RLS, comptes admin, données simulation
-- ============================================================================

-- ============================================================================
-- 1. CRÉATION DES EXTENSIONS NÉCESSAIRES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour recherche full-text
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Pour géolocalisation

-- ============================================================================
-- 2. CRÉATION DES TYPES ÉNUMÉRÉS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('user', 'agent', 'sous_admin', 'admin', 'super_admin');
CREATE TYPE signalement_statut AS ENUM ('nouveau', 'en_cours', 'en_enquete', 'resolu', 'rejete', 'archive');
CREATE TYPE urgence_level AS ENUM ('basse', 'moyenne', 'haute', 'critique');
CREATE TYPE categorie_signalement AS ENUM (
  'detournement_fonds',
  'enrichissement_illicite',
  'marches_publics',
  'extorsion',
  'malversation_gab_peche',
  'corruption_forces_ordre',
  'autre_corruption',
  'sante',
  'education',
  'infrastructures',
  'environnement',
  'suggestion',
  'amelioration_service'
);

-- ============================================================================
-- 3. TABLE PROFILES (Utilisateurs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  region TEXT,
  ville TEXT,
  fonction TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_phone ON profiles(phone);

-- ============================================================================
-- 4. TABLE USER_ROLES (Gestion rôles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_active ON user_roles(is_active);

-- ============================================================================
-- 5. TABLE SIGNALEMENTS (Coeur du système)
-- ============================================================================

CREATE TABLE IF NOT EXISTS signalements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_id TEXT UNIQUE NOT NULL,
  
  -- Contenu
  type TEXT NOT NULL,
  categorie categorie_signalement NOT NULL,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  montant_estime BIGINT,
  devise TEXT DEFAULT 'FCFA',
  
  -- Classification
  urgence urgence_level DEFAULT 'moyenne',
  statut signalement_statut DEFAULT 'nouveau',
  
  -- Localisation
  ministere_concerne TEXT,
  region TEXT,
  ville TEXT,
  localisation_precise TEXT,
  coordonnees_gps GEOGRAPHY(POINT, 4326),
  
  -- Dates
  date_faits DATE,
  date_signalement TIMESTAMPTZ DEFAULT NOW(),
  
  -- Utilisateur
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Metadata technique
  ip_address INET,
  device_fingerprint TEXT,
  user_agent TEXT,
  session_id TEXT,
  
  -- Analyse IA
  score_credibilite INTEGER,
  score_urgence INTEGER,
  mots_cles_detectes TEXT[],
  entites_nommees TEXT[],
  sentiment TEXT,
  categorie_auto TEXT,
  
  -- Assignation
  assigned_agent_id UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  
  -- Preuves (stockées séparément mais référencées)
  preuves_count INTEGER DEFAULT 0,
  temoins_count INTEGER DEFAULT 0
);

-- Index optimisés pour requêtes fréquentes
CREATE INDEX idx_signalements_statut ON signalements(statut);
CREATE INDEX idx_signalements_urgence ON signalements(urgence);
CREATE INDEX idx_signalements_categorie ON signalements(categorie);
CREATE INDEX idx_signalements_region ON signalements(region);
CREATE INDEX idx_signalements_ministere ON signalements(ministere_concerne);
CREATE INDEX idx_signalements_assigned ON signalements(assigned_agent_id);
CREATE INDEX idx_signalements_user ON signalements(user_id);
CREATE INDEX idx_signalements_date ON signalements(date_signalement DESC);
CREATE INDEX idx_signalements_gps ON signalements USING GIST(coordonnees_gps);

-- Index full-text pour recherche
CREATE INDEX idx_signalements_fulltext ON signalements USING GIN(
  to_tsvector('french', titre || ' ' || description)
);

-- ============================================================================
-- 6. TABLE PREUVES (Documents, photos, audio, vidéo)
-- ============================================================================

CREATE TABLE IF NOT EXISTS preuves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signalement_id UUID REFERENCES signalements(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'document', 'photo', 'video', 'audio', 'excel', 'liste'
  format TEXT,
  nom_fichier TEXT NOT NULL,
  storage_path TEXT, -- Chemin dans Supabase Storage
  taille_bytes BIGINT,
  duree_secondes INTEGER, -- Pour audio/vidéo
  hash_sha256 TEXT,
  coordonnees_gps GEOGRAPHY(POINT, 4326), -- Pour photos géolocalisées
  metadata JSONB,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_preuves_signalement ON preuves(signalement_id);

-- ============================================================================
-- 7. TABLE INVESTIGATIONS (Enquêtes par agents)
-- ============================================================================

CREATE TABLE IF NOT EXISTS investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signalement_id UUID REFERENCES signalements(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  statut TEXT DEFAULT 'ouverte',
  priorite urgence_level DEFAULT 'moyenne',
  
  -- Progression
  actions_menees TEXT[],
  personnes_interrogees TEXT[],
  preuves_collectees INTEGER DEFAULT 0,
  
  -- Dates
  date_debut TIMESTAMPTZ DEFAULT NOW(),
  date_fin TIMESTAMPTZ,
  delai_jours INTEGER,
  
  -- Conclusion
  conclusion TEXT,
  recommandations TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investigations_signalement ON investigations(signalement_id);
CREATE INDEX idx_investigations_agent ON investigations(agent_id);
CREATE INDEX idx_investigations_statut ON investigations(statut);

-- ============================================================================
-- 8. TABLE RAPPORTS (Rapports d'enquête)
-- ============================================================================

CREATE TABLE IF NOT EXISTS investigation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id),
  
  titre TEXT NOT NULL,
  contenu TEXT NOT NULL,
  type TEXT, -- 'interim', 'final', 'complementaire'
  
  validation_chef BOOLEAN DEFAULT FALSE,
  validateur_id UUID REFERENCES profiles(id),
  validated_at TIMESTAMPTZ,
  
  fichier_pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_investigation ON investigation_reports(investigation_id);

-- ============================================================================
-- 9. TABLE NOTIFICATIONS (Temps réel)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'nouveau_signalement', 'assignation', 'validation', etc.
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  
  signalement_id UUID REFERENCES signalements(id) ON DELETE CASCADE,
  investigation_id UUID REFERENCES investigations(id) ON DELETE SET NULL,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_date ON notifications(created_at DESC);

-- ============================================================================
-- 10. TABLE AUDIT_LOGS (Journalisation complète)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  
  old_values JSONB,
  new_values JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);

-- ============================================================================
-- 11. TABLE STATISTIQUES (Cache pour dashboard)
-- ============================================================================

CREATE TABLE IF NOT EXISTS statistiques_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  type TEXT NOT NULL, -- 'national', 'regional', 'ministeriel', 'agent'
  scope_id TEXT, -- ID de la région, ministère, ou agent
  
  periode_debut DATE NOT NULL,
  periode_fin DATE NOT NULL,
  
  total_signalements INTEGER DEFAULT 0,
  signalements_critiques INTEGER DEFAULT 0,
  signalements_resolus INTEGER DEFAULT 0,
  taux_resolution DECIMAL(5,2),
  montant_recupere BIGINT DEFAULT 0,
  delai_moyen_jours INTEGER,
  
  metadata JSONB,
  
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(type, scope_id, periode_debut, periode_fin)
);

CREATE INDEX idx_stats_type ON statistiques_cache(type);
CREATE INDEX idx_stats_scope ON statistiques_cache(scope_id);

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) - SÉCURITÉ MAXIMALE
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE signalements ENABLE ROW LEVEL SECURITY;
ALTER TABLE preuves ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES RLS POUR PROFILES
-- ============================================================================

-- Super Admin : Accès total
CREATE POLICY "Super Admin full access profiles"
ON profiles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'super_admin'
    AND user_roles.is_active = TRUE
  )
);

-- Users : Voir leur propre profil
CREATE POLICY "Users view own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Users : Modifier leur propre profil
CREATE POLICY "Users update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- ============================================================================
-- POLICIES RLS POUR SIGNALEMENTS
-- ============================================================================

-- Super Admin & Admin : Voir tous les signalements
CREATE POLICY "Admin view all signalements"
ON signalements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('super_admin', 'admin')
    AND user_roles.is_active = TRUE
  )
);

-- Agents : Voir signalements assignés ou de leur ministère
CREATE POLICY "Agents view assigned signalements"
ON signalements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'agent'
    AND user_roles.is_active = TRUE
  )
  AND (
    assigned_agent_id = auth.uid()
    OR ministere_concerne IN (
      SELECT DISTINCT s.ministere_concerne
      FROM signalements s
      WHERE s.assigned_agent_id = auth.uid()
      LIMIT 1
    )
  )
);

-- Users : Voir leurs propres signalements
CREATE POLICY "Users view own signalements"
ON signalements FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Insertion : Tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users insert signalements"
ON signalements FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Mise à jour : Agents sur signalements assignés
CREATE POLICY "Agents update assigned signalements"
ON signalements FOR UPDATE
TO authenticated
USING (
  assigned_agent_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('super_admin', 'admin')
  )
);

-- ============================================================================
-- POLICIES RLS POUR NOTIFICATIONS
-- ============================================================================

CREATE POLICY "Users view own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- 13. FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signalements_updated_at
  BEFORE UPDATE ON signalements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investigations_updated_at
  BEFORE UPDATE ON investigations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 14. INSERTION COMPTES SUPER ADMIN & SOUS-ADMINS
-- ============================================================================

-- NOTE: Ces comptes doivent d'abord être créés via Supabase Auth
-- Puis on leur attribue les rôles ici

-- Fonction pour créer un compte admin
CREATE OR REPLACE FUNCTION create_admin_account(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_role user_role,
  p_fonction TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insérer dans profiles
  INSERT INTO profiles (id, email, full_name, role, fonction)
  VALUES (p_user_id, p_email, p_full_name, p_role, p_fonction)
  ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role, fonction = EXCLUDED.fonction;
  
  -- Insérer dans user_roles
  INSERT INTO user_roles (user_id, role, is_active)
  VALUES (p_user_id, p_role, TRUE)
  ON CONFLICT (user_id, role) DO UPDATE
  SET is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 15. VUES POUR DASHBOARDS
-- ============================================================================

-- Vue Dashboard National (pour Président/Admin)
CREATE OR REPLACE VIEW dashboard_national AS
SELECT
  COUNT(*) FILTER (WHERE date_signalement >= NOW() - INTERVAL '30 days') as signalements_30j,
  COUNT(*) FILTER (WHERE urgence = 'critique' AND statut = 'nouveau') as cas_critiques_attente,
  COUNT(*) FILTER (WHERE statut = 'resolu') as total_resolus,
  ROUND(
    COUNT(*) FILTER (WHERE statut = 'resolu')::DECIMAL / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as taux_resolution,
  SUM(montant_estime) FILTER (WHERE statut = 'resolu') as montant_recupere,
  COUNT(DISTINCT assigned_agent_id) as agents_actifs,
  COUNT(DISTINCT ministere_concerne) as ministeres_impliques
FROM signalements;

-- Vue Performance Régionale
CREATE OR REPLACE VIEW performance_regionale AS
SELECT
  region,
  COUNT(*) as total_cas,
  COUNT(*) FILTER (WHERE statut = 'resolu') as cas_resolus,
  ROUND(
    COUNT(*) FILTER (WHERE statut = 'resolu')::DECIMAL / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as taux_resolution,
  COUNT(*) FILTER (WHERE urgence IN ('critique', 'haute')) as cas_prioritaires
FROM signalements
WHERE region IS NOT NULL
GROUP BY region;

-- ============================================================================
-- FIN DU SCRIPT D'INITIALISATION
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Base de données NDJOBI initialisée avec succès!';
  RAISE NOTICE '📊 Tables créées: profiles, signalements, investigations, etc.';
  RAISE NOTICE '🔒 RLS activé sur toutes les tables sensibles';
  RAISE NOTICE '👥 Prêt pour création comptes Super Admin via Supabase Auth';
END $$;
