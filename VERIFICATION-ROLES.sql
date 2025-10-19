-- ============================================================================
-- NDJOBI - VÉRIFICATION DES RÔLES APRÈS IMPORT
-- ============================================================================

-- Vérifier que l'enum user_role contient 'sous_admin'
SELECT enum_range(NULL::user_role);
-- Résultat attendu: {user,agent,sous_admin,admin,super_admin}

-- Vérifier les profils avec leurs rôles
SELECT 
  email,
  phone,
  role,
  full_name,
  fonction,
  created_at
FROM profiles
WHERE email IN (
  '33661002616@ndjobi.com',
  '24177888001@ndjobi.com',
  '24177888002@ndjobi.com',
  '24177888003@ndjobi.com'
)
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'sous_admin' THEN 3
    WHEN 'agent' THEN 4
    WHEN 'user' THEN 5
  END;

-- Résultat attendu:
-- +------------------------------+---------------+-------------+----------------------+----------------------------------+
-- | email                        | phone         | role        | full_name            | fonction                         |
-- +------------------------------+---------------+-------------+----------------------+----------------------------------+
-- | 33661002616@ndjobi.com       | +33661002616  | super_admin | Super Administrateur | Super Administrateur Système     |
-- | 24177888001@ndjobi.com       | +24177888001  | admin       | Président            | Admin - Président de la République|
-- | 24177888002@ndjobi.com       | +24177888002  | sous_admin  | DGSS                 | Sous-Admin DGSS                  |
-- | 24177888003@ndjobi.com       | +24177888003  | sous_admin  | DGR                  | Sous-Admin DGR                   |
-- +------------------------------+---------------+-------------+----------------------+----------------------------------+

-- Vérifier les rôles assignés dans user_roles
SELECT 
  p.email,
  p.phone,
  ur.role,
  ur.is_active,
  ur.assigned_at
FROM user_roles ur
JOIN profiles p ON p.id = ur.user_id
WHERE p.email LIKE '%@ndjobi.com'
AND (p.phone LIKE '+241%' OR p.phone LIKE '+336%')
ORDER BY 
  CASE ur.role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'sous_admin' THEN 3
  END;

-- Résultat attendu: 4 lignes avec is_active = true

-- Compter par rôle
SELECT 
  role,
  COUNT(*) as nombre
FROM profiles
WHERE email LIKE '%@ndjobi.com'
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'sous_admin' THEN 3
  END;

-- Résultat attendu:
-- super_admin: 1
-- admin: 1
-- sous_admin: 2

-- Vérifier la hiérarchie complète
SELECT 
  p.role,
  p.email,
  p.full_name,
  p.fonction,
  ur.is_active
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id AND ur.role = p.role
WHERE p.email LIKE '%@ndjobi.com'
ORDER BY 
  CASE p.role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'sous_admin' THEN 3
  END,
  p.email;

-- ============================================================================
-- RÉSULTAT ATTENDU FINAL
-- ============================================================================

/*
┌──────────────┬────────────────────────────────┬──────────────────────┬────────────────────────────┬───────────┐
│ role         │ email                          │ full_name            │ fonction                   │ is_active │
├──────────────┼────────────────────────────────┼──────────────────────┼────────────────────────────┼───────────┤
│ super_admin  │ 33661002616@ndjobi.com         │ Super Administrateur │ Super Administrateur Système│ true      │
│ admin        │ 24177888001@ndjobi.com         │ Président            │ Admin - Président          │ true      │
│ sous_admin   │ 24177888002@ndjobi.com         │ DGSS                 │ Sous-Admin DGSS            │ true      │
│ sous_admin   │ 24177888003@ndjobi.com         │ DGR                  │ Sous-Admin DGR             │ true      │
└──────────────┴────────────────────────────────┴──────────────────────┴────────────────────────────┴───────────┘

HIÉRARCHIE CORRECTE:
✅ 1 super_admin (33661002616)
✅ 1 admin (Président 24177888001)
✅ 2 sous_admin (DGSS 24177888002, DGR 24177888003)
*/
