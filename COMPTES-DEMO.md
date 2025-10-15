# Configuration des Comptes Démo NDJOBI

## 📋 Vue d'ensemble

Le système NDJOBI utilise des comptes démo pour permettre aux utilisateurs de tester la plateforme sans inscription complète.

## 🔐 Comptes Démo Disponibles

### 1. Compte Public (Page de connexion)

#### Citoyen
- **Téléphone**: +241 77 777 001
- **Email technique**: 24177777001@ndjobi.temp
- **PIN**: 123456
- **Rôle**: `user`
- **Accès**: Public - Visible sur la page de connexion
- **Description**: Accès utilisateur standard pour taper le Ndjobi et protéger des projets

### 2. Compte Super Admin (Accès caché)

#### Super Admin
- **Téléphone**: +241 77 777 000
- **Email technique**: 24177777000@ndjobi.ga
- **PIN**: 123456
- **Rôle**: `super_admin`
- **Accès**: Caché - Double-clic sur l'icône Shield (🛡️)
- **Description**: Accès technique complet - Gestion système

### 3. Comptes Réservés (Super Admin uniquement)

Ces comptes sont **uniquement accessibles** via le dashboard Super Admin (onglet "Démo").

#### Agent DGSS
- **Téléphone**: +241 77 777 002
- **Email technique**: 24177777002@ndjobi.temp
- **PIN**: 123456
- **Rôle**: `agent`
- **Accès**: Réservé - Via Super Admin uniquement
- **Description**: Direction Générale des Services Spéciaux

#### Protocole d'État
- **Téléphone**: +241 77 777 003
- **Email technique**: 24177777003@ndjobi.temp
- **PIN**: 123456
- **Rôle**: `admin`
- **Accès**: Réservé - Via Super Admin uniquement
- **Description**: Accès présidentiel - Administrateur


## 🎯 Fonctionnement

### Accès Public (Page /auth)
- Seul le compte **Citoyen** est affiché
- Les utilisateurs peuvent tester les fonctionnalités de base
- Connexion directe via le bouton dédié

### Accès Super Admin (Double-clic sur Shield)
- Double-clic sur l'icône Shield (🛡️) dans le titre "Authentification"
- Saisie du code spécial : `011282*`
- Accès direct au dashboard Super Admin
- Authentification biométrique disponible sur mobile

### Accès Super Admin (Dashboard Super Admin > Démo)
- Tous les comptes démo sont listés
- Bouton "Accès direct" pour basculer instantanément vers un compte
- Permet de tester tous les rôles sans déconnexion/reconnexion
- Bouton "Retour Super Admin" dans le header pour revenir

## 🔧 Configuration Technique

### Fichiers concernés
- `/src/pages/Auth.tsx`: Configuration des comptes publics
- `/src/pages/dashboards/SuperAdminDashboard.tsx`: Configuration des comptes Super Admin
- `/src/services/accountSwitching.ts`: Service de basculement de comptes

### Format d'email technique
Les emails techniques sont construits selon le format :
```
{indicatif_sans_plus}{numero}@ndjobi.temp
```

Exemple : +241 77 777 001 → 24177777001@ndjobi.temp

### Sécurité
- Les comptes Agent DGSS et Protocole d'État ne sont pas exposés publiquement
- Seul le Super Admin peut y accéder via le basculement de compte
- Le compte original est sauvegardé lors du basculement
- Retour sécurisé au compte Super Admin via bouton dédié

## 🚀 Création des Comptes

Pour créer ces comptes dans Supabase :

1. Via l'interface normale :
   - Aller sur la page d'inscription
   - Utiliser le numéro de téléphone exact
   - Définir le PIN à 123456
   - Le rôle sera attribué automatiquement

2. Via SQL (recommandé pour la production) :
   - Utiliser le script `/scripts/create-demo-accounts-base.sql`
   - Exécuter via le dashboard Supabase

## 📝 Notes

- Les comptes démo sont identifiés par leurs numéros de téléphone spécifiques (77 777 0XX)
- Le PIN est toujours 123456 pour tous les comptes démo
- Les comptes ne sont pas créés automatiquement, ils doivent être créés manuellement
- Les données de test peuvent être ajoutées séparément pour chaque compte

