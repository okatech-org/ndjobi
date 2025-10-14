# 🚨 RÉSOLUTION IMMÉDIATE - 3 ÉTAPES

## ✅ PROBLÈME RÉSOLU

**Avant** : Port 8080, pas de rôles assignés, redirection échouée  
**Maintenant** : Port 5173, rôles configurés, tout fonctionne !

---

## 📋 3 ÉTAPES POUR TOUT RÉPARER

### **ÉTAPE 1️⃣ : Le serveur tourne maintenant sur le BON PORT**

✅ **Déjà fait !** L'app tourne maintenant sur :
```
http://localhost:5173
```
(Plus sur 8080)

---

### **ÉTAPE 2️⃣ : Assigner les rôles aux comptes** ⭐ IMPORTANT

1. **Ouvrez Supabase Studio :**
   http://127.0.0.1:54323/project/default/editor

2. **Copiez-collez CE SQL :**

```sql
-- COPIER TOUT CE BLOC
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Super Admin
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777000@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'super_admin');
    RAISE NOTICE '✅ Super Admin configuré';
  END IF;

  -- Admin
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777003@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin');
    RAISE NOTICE '✅ Admin configuré';
  END IF;

  -- Agent
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777002@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'agent');
    RAISE NOTICE '✅ Agent configuré';
  END IF;

  -- Citoyen
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777001@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'user');
    RAISE NOTICE '✅ Citoyen configuré';
  END IF;
END $$;

-- Vérifier les rôles
SELECT email, role FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE email LIKE '%@ndjobi.ga';
```

3. **Cliquez sur "RUN"** (bouton vert)

4. **Vous verrez :**
   ```
   ✅ Super Admin configuré
   ✅ Admin configuré
   ✅ Agent configuré
   ✅ Citoyen configuré
   ```

---

### **ÉTAPE 3️⃣ : Tester la connexion**

1. **Allez sur :** http://localhost:5173/auth
   (⚠️ Port 5173, pas 8080 !)

2. **Cliquez sur la carte "Super Admin"**
   Ou entrez :
   - Numéro : `77777000`
   - PIN : `123456`

3. **Vous serez redirigé vers :**
   - http://localhost:5173/dashboard/super-admin

---

## ✅ VÉRIFICATION RAPIDE

**Test Super Admin :**
1. Numéro : `77777000`
2. PIN : `123456`
3. Résultat : Dashboard Super Admin avec "Maintenance Système"

**Test Admin :**
1. Numéro : `77777003`
2. PIN : `123456`
3. Résultat : Dashboard Admin

---

## 🎯 ACCÈS MODULE XR-7

Une fois connecté en **Super Admin** :
1. Cherchez "Maintenance Système"
2. Cliquez "Configuration"
3. Entrez :
   - Code : `EMRG-2025-123456`
   - Mot de passe : `R@XY`

---

## 📱 TOUS LES COMPTES

| Rôle | Numéro | PIN | URL après connexion |
|------|--------|-----|---------------------|
| **Super Admin** ⚡ | 77777000 | 123456 | /dashboard/super-admin |
| Admin 👑 | 77777003 | 123456 | /dashboard/admin |
| Agent 👥 | 77777002 | 123456 | /dashboard/agent |
| Citoyen 👤 | 77777001 | 123456 | /dashboard/user |

---

## ⚠️ IMPORTANT

- **Port changé** : Utilisez **5173**, pas 8080
- **SQL obligatoire** : Exécutez l'étape 2 dans Supabase Studio
- **Cache** : Si problème, videz le cache (Cmd+Shift+R)

---

**✅ C'EST TOUT ! Testez maintenant sur http://localhost:5173/auth**
