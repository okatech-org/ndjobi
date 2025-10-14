# 🔐 ACCÈS SUPER ADMIN - NDJOBI

## Option 1 : Compte Démo (Méthode Simple) ⭐

1. Allez sur : http://localhost:5173/auth
2. Cliquez sur la carte **"Super Admin"** (icône éclair rouge ⚡)
3. Le système se connectera automatiquement avec :
   - 📱 **Téléphone** : +24177777000
   - 🔐 **Code PIN** : 123456
   
**Note** : Le système utilise l'authentification par numéro de téléphone, pas par email.

---

## Option 2 : Créer votre propre Super Admin

### Méthode A : Via Supabase Dashboard

1. Connectez-vous à Supabase Dashboard
2. Allez dans **Authentication** → **Users**
3. Créez un nouvel utilisateur ou trouvez votre utilisateur existant
4. Copiez son UUID
5. Allez dans **Table Editor** → **user_roles**
6. Insérez une nouvelle ligne :
   ```
   user_id: [UUID de l'utilisateur]
   role: super_admin
   ```

### Méthode B : Via Script SQL

Exécutez ce SQL dans Supabase SQL Editor :

```sql
-- Remplacez 'votre.email@example.com' par votre email
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'votre.email@example.com';
  
  IF v_user_id IS NOT NULL THEN
    -- Supprimer l'ancien rôle s'il existe
    DELETE FROM public.user_roles 
    WHERE user_id = v_user_id;
    
    -- Assigner le rôle super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin');
    
    RAISE NOTICE 'Super Admin role assigned to user %', v_user_id;
  ELSE
    RAISE NOTICE 'User not found';
  END IF;
END $$;
```

---

## Option 3 : Script Rapide (Recommandé)

J'ai créé un script pour vous faciliter la tâche. Exécutez :

```bash
./scripts/create-super-admin.sh
```

Il vous demandera votre email et créera automatiquement le super admin.

---

## Vérification

Une fois connecté en Super Admin, vous devriez voir :
1. Dashboard avec panneau "Super Admin" en rouge
2. Carte "Maintenance Système" pour le module XR-7
3. Statistiques système complètes
4. Tous les outils d'administration

---

## Problème de Connexion ?

Si le compte démo ne fonctionne pas, essayez :

1. **Vider le cache du navigateur**
2. **Ouvrir une fenêtre privée/incognito**
3. **Vérifier que Supabase est bien démarré**
   ```bash
   supabase status
   ```
4. **Réinitialiser les migrations**
   ```bash
   supabase db reset
   ```

---

## Accès Module XR-7

Une fois connecté en Super Admin :
1. Cherchez "Maintenance Système"
2. Cliquez "Configuration"
3. Entrez :
   - Code : EMRG-2025-123456
   - Mot de passe : R@XY
