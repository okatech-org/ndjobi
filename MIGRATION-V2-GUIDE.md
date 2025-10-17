# Guide de Migration NDJOBI v2.0

## ⚠️ IMPORTANT - LIRE AVANT D'EXÉCUTER

Cette migration est **DESTRUCTIVE** et **IRRÉVERSIBLE**. Elle supprime tous les comptes démo et restructure la base de données.

## Pré-requis

1. ✅ **Backup complet de la base de données**
2. ✅ **Variables d'environnement configurées** (`.env.local`)
   ```bash
   VITE_SUPER_ADMIN_CODE=votre_code_securise
   VITE_SUPER_ADMIN_EMAIL=superadmin@ndjobi.com
   VITE_SUPER_ADMIN_PASSWORD=votre_mot_de_passe_securise
   ```
3. ✅ **Accès Supabase Dashboard avec droits admin**

## Étapes de Migration

### 1. Backup (OBLIGATOIRE)

```bash
# Via Supabase Dashboard
# Settings > Database > Backup > Create Backup
```

### 2. Exécuter le Script de Migration

**Option A : Via Supabase Dashboard (RECOMMANDÉ)**

1. Ouvrir Supabase Dashboard
2. Aller dans **SQL Editor**
3. Créer une nouvelle query
4. Copier le contenu de `supabase/migrations/20250117000000_ndjobi_v2_migration.sql`
5. Cliquer sur **Run**
6. Vérifier les messages de sortie

**Option B : Via Supabase CLI**

```bash
# Appliquer la migration
supabase db reset

# Ou appliquer uniquement cette migration
supabase migration up
```

### 3. Créer le Compte Super Admin

**Via Supabase Dashboard > Authentication**

1. Aller dans **Authentication > Users**
2. Cliquer sur **Add user**
3. Renseigner :
   - Email : `superadmin@ndjobi.com`
   - Password : (votre mot de passe sécurisé, identique à `VITE_SUPER_ADMIN_PASSWORD`)
   - Confirm Email : ✅
4. Cliquer sur **Create user**

**Puis exécuter dans SQL Editor** :

```sql
-- Récupérer l'ID du nouveau compte
SELECT id, email FROM auth.users WHERE email = 'superadmin@ndjobi.com';

-- Remplacer USER_ID par l'ID récupéré ci-dessus
DO $$
DECLARE
    v_super_admin_id UUID := 'USER_ID'; -- Remplacer par l'ID réel
BEGIN
    -- Créer/mettre à jour le profil
    INSERT INTO profiles (id, email, full_name, organization)
    VALUES (
        v_super_admin_id, 
        'superadmin@ndjobi.com',
        'Administrateur Système',
        'NDJOBI Platform'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = 'superadmin@ndjobi.com',
        full_name = 'Administrateur Système',
        organization = 'NDJOBI Platform';
    
    -- Assigner le rôle super_admin
    INSERT INTO user_roles (user_id, role)
    VALUES (v_super_admin_id, 'super_admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
END $$;
```

### 4. Vérifications Post-Migration

**Exécuter dans SQL Editor** :

```sql
-- 1. Vérifier les comptes système
SELECT 
    ur.role,
    p.email,
    p.full_name,
    p.organization
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.role IN ('super_admin', 'admin', 'agent')
ORDER BY ur.role;

-- 2. Vérifier qu'il n'y a plus de comptes démo
SELECT COUNT(*) as demo_accounts_remaining
FROM auth.users
WHERE email LIKE '%@ndjobi.temp'
   OR email LIKE '%77777%@ndjobi.ga';

-- 3. Vérifier les signalements sauvegardés
SELECT COUNT(*) as saved_signalements
FROM migration_backup
WHERE table_name = 'signalements';

-- 4. Vérifier les index créés
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('signalements', 'investigations', 'user_roles');
```

### 5. Test de Connexion

1. **Test Super Admin** :
   ```bash
   # Aller sur http://localhost:5173
   # Double-cliquer sur l'icône Shield
   # Entrer le code configuré dans VITE_SUPER_ADMIN_CODE
   # Vérifier l'accès au dashboard Super Admin
   ```

2. **Test Compte Système** :
   - Se connecter avec `protocole@presidence.ga` (créer le mot de passe dans Supabase Auth)
   - Vérifier l'accès Admin

## Ce que fait la migration

### ✅ Actions effectuées

1. **Sauvegarde** :
   - Signalements critiques → `migration_backup`

2. **Suppression** :
   - Tous les comptes `*@ndjobi.temp`
   - Tous les comptes `*@ndjobi.ga` (sauf Super Admin)
   - Sessions obsolètes (> 30 jours)
   - Signalements orphelins

3. **Migration** :
   - Super Admin : `24177777000@ndjobi.ga` → `superadmin@ndjobi.com`

4. **Création** :
   - Comptes système :
     * `protocole@presidence.ga` (admin)
     * `dgss.principal@securite.ga` (agent)
     * `agent.lac@justice.ga` (agent)

5. **Optimisation** :
   - Index sur `signalements`, `investigations`, `user_roles`
   - Politiques RLS strictes

### ⚠️ Données supprimées

- Tous les signalements des comptes démo
- Toutes les investigations associées
- Toutes les sessions démo

## Rollback (en cas d'erreur)

**Via Supabase Dashboard** :

1. Settings > Database > Backups
2. Sélectionner le backup pré-migration
3. Cliquer sur **Restore**

## Support

En cas de problème :
1. Vérifier les logs de migration dans Supabase Dashboard
2. Consulter `migration_backup` pour les données sauvegardées
3. Contacter le support technique

## Checklist Finale

- [ ] Backup complet effectué
- [ ] Variables d'environnement configurées
- [ ] Script de migration exécuté sans erreur
- [ ] Compte Super Admin créé et fonctionnel
- [ ] Vérifications post-migration OK
- [ ] Test de connexion Super Admin réussi
- [ ] Code source mis à jour (authService, useAuth v2)
- [ ] Application redéployée

---

**Version** : 2.0.0  
**Date** : 17/01/2025  
**Auteur** : NDJOBI Platform

