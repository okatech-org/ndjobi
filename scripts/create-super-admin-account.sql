-- Script pour créer le compte Super Admin
-- Email: 24177777000@ndjobi.ga
-- Mot de passe: 123456
-- Rôle: super_admin

-- Note: Ce script doit être exécuté via l'interface Supabase ou via l'API
-- car il nécessite des privilèges d'authentification

-- Instructions d'utilisation :
-- 1. Aller sur la page d'authentification (/auth)
-- 2. Utiliser le compte démo "Super Admin" avec le numéro +241 77 777 000
-- 3. OU créer manuellement le compte via l'interface d'inscription

-- Alternative : Utiliser l'API Supabase pour créer le compte
-- (nécessite une clé service_role)

-- Vérification que le compte existe :
-- SELECT * FROM auth.users WHERE email = '24177777000@ndjobi.ga';

-- Vérification du rôle :
-- SELECT ur.role, p.email 
-- FROM user_roles ur 
-- JOIN profiles p ON p.id = ur.user_id 
-- WHERE p.email = '24177777000@ndjobi.ga';
