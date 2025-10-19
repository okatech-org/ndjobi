-- ============================================================================
-- NDJOBI - INSERTION CAS PÊCHE GAB & CAS CRITIQUES
-- ============================================================================

-- Cas 1: Coopérative fantôme Gab Pêche - 5 Milliards FCFA
INSERT INTO signalements (
  reference_id, type, categorie, titre, description,
  montant_estime, urgence, priority, status,
  ministere_concerne, location, region, ville,
  localisation_precise, date_faits, date_signalement,
  is_anonymous, ai_priority_score, ai_analysis_summary, metadata,
  created_at, updated_at
) VALUES (
  'SIG-2025-014',
  'denonciation_corruption',
  'malversation_gab_peche',
  'Coopérative fantôme Gab Pêche - Détournement subventions',
  'La ''Coopérative Nationale des Pêcheurs Unis'' inscrite dans Gab Pêche n''existe pas ! C''est une arnaque montée par un conseiller du ministre. Cette coopérative fantôme a reçu 340 millions FCFA de subventions (10 pirogues + équipements + prêts BCEG). MAIS il n''y a aucun pêcheur membre ! Les pirogues ont été livrées dans un entrepôt privé à Ntoum et revendues à des Nigérians. Les documents d''inscription à la coopérative utilisent des faux noms et des photos volées sur Facebook. Le président de cette coopérative bidon est en réalité le cousin du conseiller du ministre. Ils ont créé 15 coopératives fictives comme celle-ci pour capter les aides de Gab Pêche. Total détourné : environ 5 milliards FCFA.',
  5000000000,
  'critique',
  'critique',
  'pending',
  'Mer et Pêche',
  'Libreville, Estuaire',
  'Estuaire',
  'Libreville',
  'Ministère de la Mer - Cabinet du Conseiller',
  '2024-09-01',
  '2025-01-10T16:23:41Z',
  false,
  99,
  'Réseau organisé de fraude massive. 15 coopératives fictives détectées. Montant total: 5 milliards FCFA. Implication haute fonction publique confirmée.',
  jsonb_build_object(
    'score_credibilite', 97,
    'score_urgence', 99,
    'mots_cles', ARRAY['Gab Pêche', 'coopérative fantôme', '5 milliards', 'conseiller ministre', 'réseau organisé'],
    'categorie_ia', 'corruption_gab_peche_reseau_organise',
    'preuves', ARRAY['liste_15_cooperatives_fictives.pdf', 'virements_subventions_cooperatives_fantomes.xlsx', 'faux_documents_inscription_facebook_photos.pdf', 'pirogues_entrepot_ntoum_revente.jpg'],
    'gravite', 'CRITIQUE',
    'action_recommandee', 'Enquête immédiate - Saisie des biens - Gel des comptes bancaires'
  ),
  '2025-01-10T16:23:41Z',
  NOW()
)
ON CONFLICT (reference_id) DO UPDATE SET
  montant_estime = EXCLUDED.montant_estime,
  priority = EXCLUDED.priority,
  ai_priority_score = EXCLUDED.ai_priority_score,
  ai_analysis_summary = EXCLUDED.ai_analysis_summary,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Cas 2: Matériel Gab Pêche revendu en Guinée Équatoriale
INSERT INTO signalements (
  reference_id, type, categorie, titre, description,
  montant_estime, urgence, priority, status,
  ministere_concerne, location, region, ville,
  date_faits, date_signalement, is_anonymous,
  ai_priority_score, ai_analysis_summary, metadata,
  created_at, updated_at
) VALUES (
  'SIG-2025-027',
  'denonciation_corruption',
  'malversation_gab_peche',
  'Matériel de pêche Gab Pêche revendu en Guinée Équatoriale',
  'Du matériel de pêche Gab Pêche (moteurs hors-bord, filets, GPS) est revendu en Guinée Équatoriale ! J''ai vu de mes propres yeux des camions chargés partir vers la frontière la nuit. Les moteurs neufs sont revendus 3 fois le prix à Bata et Malabo. Un réseau de contrebande organisé par des proches du projet. Montant estimé : 450 millions FCFA de matériel détourné. Pendant ce temps, les vrais pêcheurs gabonais attendent leur équipement depuis 6 mois.',
  450000000,
  'haute',
  'haute',
  'pending',
  'Mer et Pêche',
  'Libreville, Estuaire',
  'Estuaire',
  'Libreville',
  '2025-01-01',
  '2025-01-06T09:23:51Z',
  true,
  83,
  'Contrebande transfrontalière organisée. Matériel destiné aux pêcheurs gabonais détourné vers Guinée Équatoriale. 450M FCFA.',
  jsonb_build_object(
    'score_credibilite', 87,
    'score_urgence', 83,
    'mots_cles', ARRAY['Gab Pêche', 'contrebande', 'Guinée Équatoriale', 'matériel détourné'],
    'categorie_ia', 'trafic_transfrontalier_gab_peche',
    'gravite', 'HAUTE',
    'action_recommandee', 'Contrôles frontaliers renforcés - Investigation douanière'
  ),
  '2025-01-06T09:23:51Z',
  NOW()
)
ON CONFLICT (reference_id) DO UPDATE SET
  montant_estime = EXCLUDED.montant_estime,
  priority = EXCLUDED.priority,
  ai_priority_score = EXCLUDED.ai_priority_score,
  updated_at = NOW();

-- Cas 3: Ambulances fantômes - Haut-Ogooué
INSERT INTO signalements (
  reference_id, type, categorie, titre, description,
  montant_estime, urgence, priority, status,
  ministere_concerne, location, region, ville,
  localisation_precise, date_faits, date_signalement,
  is_anonymous, ai_priority_score, ai_analysis_summary, metadata,
  created_at, updated_at
) VALUES (
  'SIG-2025-011',
  'denonciation_corruption',
  'detournement_fonds',
  'Détournement budget santé - Achat ambulances fantômes',
  'Je suis comptable à la Direction Régionale de la Santé du Haut-Ogooué. Le budget 2024 prévoyait l''achat de 12 ambulances pour les centres de santé ruraux (1,2 milliard FCFA). Les factures d''achat existent, signées et tamponnées. MAIS les ambulances n''ont jamais été livrées ! Les centres de santé de Lékoni, Bakoumba et Akiéni n''ont rien reçu. J''ai vérifié personnellement. Le directeur régional m''a menacé de licenciement si j''en parle. L''argent a été versé à une société écran basée au Bénin, dont le gérant est le beau-frère du directeur. J''ai tous les justificatifs : virements bancaires, fausses factures, certificats de livraison falsifiés.',
  1200000000,
  'critique',
  'critique',
  'pending',
  'Santé',
  'Franceville, Haut-Ogooué',
  'Haut-Ogooué',
  'Franceville',
  'Direction Régionale Santé',
  '2024-03-15',
  '2025-01-11T18:32:14Z',
  true,
  98,
  'Détournement avéré de fonds publics. Société écran internationale. Menaces sur lanceur d''alerte. Preuves documentaires disponibles.',
  jsonb_build_object(
    'score_credibilite', 96,
    'score_urgence', 98,
    'mots_cles', ARRAY['détournement', 'ambulances fantômes', 'société écran', 'menaces', 'lanceur d''alerte'],
    'categorie_ia', 'detournement_fonds_critique',
    'preuves', ARRAY['budget_sante_2024_ambulances.pdf', 'factures_falsifiees_societe_benin.pdf', 'virements_bancaires_suspect.xlsx', 'centres_sante_sans_ambulances.jpg'],
    'gravite', 'CRITIQUE',
    'action_recommandee', 'Protection du lanceur d''alerte - Enquête judiciaire - Audit externe'
  ),
  '2025-01-11T18:32:14Z',
  NOW()
)
ON CONFLICT (reference_id) DO UPDATE SET
  montant_estime = EXCLUDED.montant_estime,
  priority = EXCLUDED.priority,
  ai_priority_score = EXCLUDED.ai_priority_score,
  updated_at = NOW();

-- Cas 4: Enrichissement illicite Directeur CNSS
INSERT INTO signalements (
  reference_id, type, categorie, titre, description,
  montant_estime, urgence, priority, status,
  ministere_concerne, location, region, ville,
  localisation_precise, date_faits, date_signalement,
  is_anonymous, ai_priority_score, ai_analysis_summary, metadata,
  created_at, updated_at
) VALUES (
  'SIG-2025-022',
  'denonciation_corruption',
  'enrichissement_illicite',
  'Directeur CNSS - Villa 12 chambres et fleet de luxe',
  'Le Directeur Général de la CNSS vit comme un prince. Villa de 12 chambres à Libreville (quartier Sablière), estimée à 1,8 milliard FCFA. Flotte personnelle : 3 Mercedes, 2 Range Rover, 1 Bentley. Voyages mensuels en jet privé. Son salaire officiel : 18 millions FCFA/mois. Impossible de justifier ce train de vie. Ses enfants étudient à Londres et Paris dans les écoles les plus chères (50 000€/an chacun). Sa femme possède 4 boutiques de luxe. Source probable : détournement des cotisations CNSS. Des millions de Gabonais cotisent, l''argent s''évapore.',
  6700000000,
  'critique',
  'critique',
  'pending',
  'Affaires Sociales',
  'Libreville, Estuaire',
  'Estuaire',
  'Libreville',
  'Quartier Sablière',
  '2024-01-01',
  '2025-01-07T21:45:19Z',
  true,
  92,
  'Enrichissement illicite flagrant. Train de vie incompatible avec revenus déclarés. 6,7 milliards FCFA estimés.',
  jsonb_build_object(
    'score_credibilite', 89,
    'score_urgence', 92,
    'mots_cles', ARRAY['enrichissement illicite', 'CNSS', 'train de vie', 'détournement cotisations'],
    'categorie_ia', 'enrichissement_illicite_haute_fonction',
    'gravite', 'CRITIQUE',
    'action_recommandee', 'Audit patrimonial - Enquête DGLIC - Gel des avoirs'
  ),
  '2025-01-07T21:45:19Z',
  NOW()
)
ON CONFLICT (reference_id) DO UPDATE SET
  montant_estime = EXCLUDED.montant_estime,
  priority = EXCLUDED.priority,
  ai_priority_score = EXCLUDED.ai_priority_score,
  updated_at = NOW();

-- Afficher le résultat
SELECT 
  reference_id, 
  titre,
  ROUND(montant_estime / 1000000000.0, 2) || ' Mrd FCFA' as montant,
  urgence,
  status
FROM signalements
WHERE reference_id IN ('SIG-2025-014', 'SIG-2025-027', 'SIG-2025-011', 'SIG-2025-022')
ORDER BY montant_estime DESC;

