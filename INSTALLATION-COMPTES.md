# 🚀 Installation des Comptes de Production NDJOBI

## 📋 Vue d'ensemble

Ce guide vous permet de créer automatiquement les 10 comptes de production avec leur hiérarchie complète.

## ✅ Comptes à créer

| Rôle | Téléphone | PIN | Description |
|------|-----------|-----|-------------|
| Super Admin | +33 6 61 00 26 16 | 999999 | Contrôle total système |
| Admin Principal | +241 77 888 001 | 111111 | Président/Supervision globale |
| Sous-Admin DGSS | +241 77 888 002 | 222222 | Vue sectorielle DGSS |
| Sous-Admin DGR | +241 77 888 003 | 333333 | Vue sectorielle DGR |
| Agent Défense | +241 77 888 004 | 444444 | Enquêtes ministère Défense |
| Agent Justice | +241 77 888 005 | 555555 | Enquêtes ministère Justice |
| Agent LAC | +241 77 888 006 | 666666 | Lutte Anti-Corruption |
| Agent Intérieur | +241 77 888 007 | 777777 | Enquêtes ministère Intérieur |
| Citoyen | +241 77 888 008 | 888888 | Utilisateur standard |
| Anonyme | +241 77 888 009 | 999999 | Signalements anonymes |

## 🔧 Option 1 : Script Automatisé (Recommandé)

### Prérequis
```bash
# Installer les dépendances si nécessaire
npm install @supabase/supabase-js
```

### Exécution

1. **Obtenir la clé Service Role de Supabase**:
   - Ouvrez votre projet sur Lovable
   - Allez dans les paramètres Cloud
   - Copiez la `Service Role Key`

2. **Exécuter le script**:
```bash
# Définir la variable d'environnement
export SUPABASE_SERVICE_ROLE_KEY="votre_service_role_key_ici"

# Exécuter le script
npx ts-node scripts/create-production-accounts.ts
```

### Résultat attendu
```
🚀 NDJOBI - Création des comptes de production
============================================================

📱 Création : Super Admin (super_admin)
   Tel: +33661002616
   ✅ Utilisateur créé: xxx-xxx-xxx
   ✅ Profil créé
   ✅ Rôle assigné: super_admin

... (répété pour chaque compte)

✅ SETUP TERMINÉ AVEC SUCCÈS!
```

## 🗄️ Option 2 : SQL Direct (via Dashboard)

Si vous préférez utiliser le SQL Editor de Supabase:

1. **Ouvrez le SQL Editor** dans votre projet Lovable Cloud

2. **Copiez et exécutez ce script SQL**:

```sql
-- Note: Les utilisateurs doivent d'abord être créés via l'API Auth
-- Ce script assigne seulement les rôles aux utilisateurs existants

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Super Admin
  SELECT id INTO v_user_id FROM auth.users WHERE email = '33661002616@ndjobi.com';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RAISE NOTICE 'Super Admin configuré';
  END IF;

  -- Admin Principal
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177888001@ndjobi.com';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE profiles SET full_name = 'Président - Administrateur Principal' WHERE id = v_user_id;
    RAISE NOTICE 'Admin Principal configuré';
  END IF;

  -- Sous-Admin DGSS
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177888002@ndjobi.com';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE profiles SET full_name = 'Sous-Admin DGSS' WHERE id = v_user_id;
    RAISE NOTICE 'Sous-Admin DGSS configuré';
  END IF;

  -- Sous-Admin DGR
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177888003@ndjobi.com';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE profiles SET full_name = 'Sous-Admin DGR' WHERE id = v_user_id;
    RAISE NOTICE 'Sous-Admin DGR configuré';
  END IF;

  -- Agents
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177888004@ndjobi.com';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'agent')
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE profiles SET full_name = 'Agent Défense' WHERE id = v_user_id;
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177888005@ndjobi.com';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'agent')
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE profiles SET full_name = 'Agent Justice' WHERE id = v_user_id;
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177888006@ndjobi.com';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'agent')
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE profiles SET full_name = 'Agent Lutte Anti-Corruption' WHERE id = v_user_id;
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177888007@ndjobi.com';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'agent')
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE profiles SET full_name = 'Agent Intérieur' WHERE id = v_user_id;
  END IF;

  -- Users
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177888008@ndjobi.com';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE profiles SET full_name = 'Citoyen Utilisateur' WHERE id = v_user_id;
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177888009@ndjobi.com';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE profiles SET full_name = 'Utilisateur Anonyme' WHERE id = v_user_id;
  END IF;

  RAISE NOTICE '✅ Configuration des rôles terminée';
END $$;

-- Vérification
SELECT 
  p.full_name,
  p.email,
  ur.role,
  u.phone
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
JOIN auth.users u ON p.id = u.id
WHERE p.email LIKE '%@ndjobi.com'
ORDER BY 
  CASE ur.role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'agent' THEN 3
    WHEN 'user' THEN 4
  END;
```

**⚠️ Important**: Ce script SQL n'assigne que les rôles. Les utilisateurs doivent d'abord exister dans `auth.users`. Utilisez l'Option 1 (script automatisé) pour créer les comptes complets.

## 🔐 Sécurité

### Permissions par rôle

**Super Admin**:
- Contrôle total système
- Impersonation
- Monitoring technique
- Gestion utilisateurs

**Admin**:
- Supervision globale (Admin Principal)
- Vue sectorielle étendue (Sous-Admins)
- Validation des signalements
- Supervision des agents

**Agent**:
- Enquêtes opérationnelles
- Signalements assignés uniquement
- Cloisonnement par ministère

**User**:
- Envoi de signalements
- Suivi de leurs propres signalements
- Consultation statistiques publiques
- Mode anonyme disponible

## 🧪 Test des comptes

Après création, testez chaque compte:

```bash
# URL de connexion
https://ndjobi.lovable.app/auth

# Test Super Admin
Téléphone: +33661002616
PIN: 999999

# Test Admin
Téléphone: +24177888001
PIN: 111111
```

## ❓ Dépannage

### Erreur "User already exists"
```bash
# Le script gère automatiquement les comptes existants
# Il mettra à jour les rôles au lieu de créer un doublon
```

### Service Role Key manquante
```bash
# Obtenez-la depuis:
# Lovable → Projet → Settings → Cloud → Service Role Key
```

### Problème de connexion
```bash
# Vérifiez que Twilio est configuré pour l'OTP
# Ou désactivez la vérification email dans Supabase Auth
```

## 📞 Support

En cas de problème:
1. Vérifiez les logs du script
2. Consultez le SQL Editor pour voir les utilisateurs créés
3. Vérifiez les variables d'environnement Supabase

---

**Note**: Ce guide utilise Lovable Cloud (Supabase) pour la gestion des comptes. Tous les mots de passe et PINs sont stockés de manière sécurisée.
