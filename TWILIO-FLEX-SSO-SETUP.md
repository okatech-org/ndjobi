# Configuration SSO Twilio Flex - Guide Complet

## 📋 Informations Flex (Service Provider)

**Entity ID (Audience URI):**
```
urn:flex:JQ5792467d5f2af20b10a4362cf4ec03d3
```

**ACS URL (Assertion Consumer Service URL):**
```
https://login.flex.us1.twilio.com/login/callback?connection=JQ5792467d5f2af20b10a4362cf4ec03d3
```

**Protocole:** SAML 2.0  
**NameID Format:** EmailAddress  
**Binding:** HTTP-POST

---

## 🎯 Attributs SAML Obligatoires

Votre IdP doit envoyer ces 3 attributs dans l'assertion SAML:

| Attribut | Description | Valeur exemple | Format |
|----------|-------------|----------------|---------|
| `full_name` | Nom complet de l'utilisateur | "Jean Dupont" | String |
| `email` | Adresse e-mail (aussi en NameID) | "jean.dupont@entreprise.com" | String |
| `flex_role` | Rôle dans Flex | "agent" ou "supervisor" ou "administrator" | String |

---

## 🔧 Configuration par Identity Provider

### Option 1: Okta

#### Étape 1: Créer l'application
1. **Okta Admin Console** → **Applications** → **Create App Integration**
2. Sélectionner: **SAML 2.0**
3. Cliquer **Next**

#### Étape 2: General Settings
- **App name:** Twilio Flex
- **App logo:** (optionnel)
- Cliquer **Next**

#### Étape 3: Configure SAML
**General:**
- **Single sign on URL:** 
  ```
  https://login.flex.us1.twilio.com/login/callback?connection=JQ5792467d5f2af20b10a4362cf4ec03d3
  ```
- Cocher: ✅ Use this for Recipient URL and Destination URL
- **Audience URI (SP Entity ID):**
  ```
  urn:flex:JQ5792467d5f2af20b10a4362cf4ec03d3
  ```
- **Name ID format:** EmailAddress
- **Application username:** Email

**Attribute Statements:**
| Name | Name format | Value |
|------|-------------|-------|
| `full_name` | Unspecified | `user.displayName` |
| `email` | Unspecified | `user.email` |
| `flex_role` | Unspecified | `appuser.flex_role` (ou mapping depuis groupe) |

**Group Attribute Statements (optionnel):**
Si vous utilisez des groupes Okta pour gérer les rôles:
- Name: `groups`
- Filter: Matches regex → `.*` (ou filtrer par nom de groupe)

#### Étape 4: Feedback
- **I'm an Okta customer adding an internal app**
- Cliquer **Finish**

#### Étape 5: Assigner des utilisateurs
1. **Assignments** tab → **Assign** → **Assign to People** ou **Assign to Groups**
2. Pour chaque utilisateur:
   - Assigner l'utilisateur
   - Dans le profile, définir `flex_role` = `agent` | `supervisor` | `administrator`
   - Save

#### Étape 6: Récupérer les informations pour Flex
1. **Sign On** tab
2. Cliquer **View SAML setup instructions**
3. Copier:
   - **Identity Provider Single Sign-On URL** → C'est votre **Single sign-on URL**
   - Section **Provide the following IDP metadata to your SP provider**
   - Télécharger ou copier le **X.509 Certificate**

**Format attendu du certificat:**
```
-----BEGIN CERTIFICATE-----
MIIDpDCCAoygAwIBAgIGAYqK...
[plusieurs lignes]
...xYZ123==
-----END CERTIFICATE-----
```

---

### Option 2: Microsoft Azure AD (Entra ID)

#### Étape 1: Créer l'application
1. **Azure Portal** → **Azure Active Directory** → **Enterprise applications**
2. **New application** → **Create your own application**
3. Name: "Twilio Flex"
4. Sélectionner: **Integrate any other application you don't find in the gallery (Non-gallery)**
5. Cliquer **Create**

#### Étape 2: Configurer Single Sign-On
1. Dans l'application créée → **Single sign-on** → **SAML**
2. Cliquer **Edit** sur "Basic SAML Configuration"

**Basic SAML Configuration:**
- **Identifier (Entity ID):**
  ```
  urn:flex:JQ5792467d5f2af20b10a4362cf4ec03d3
  ```
- **Reply URL (Assertion Consumer Service URL):**
  ```
  https://login.flex.us1.twilio.com/login/callback?connection=JQ5792467d5f2af20b10a4362cf4ec03d3
  ```
- **Sign on URL (optionnel):**
  ```
  https://flex.twilio.com
  ```
- Cliquer **Save**

#### Étape 3: User Attributes & Claims
1. Cliquer **Edit** sur "Attributes & Claims"
2. Claims requis:

**Claim par défaut:**
- **Unique User Identifier (Name ID):**
  - Source: Attribute
  - Source attribute: `user.mail`

**Claims additionnels:**
Cliquer **Add new claim** pour chaque:

| Name | Source | Source attribute |
|------|--------|------------------|
| `full_name` | Attribute | `user.displayname` |
| `email` | Attribute | `user.mail` |
| `flex_role` | Attribute | `user.extension_attribute1` (ou custom) |

**Note:** Pour `flex_role`, vous devez soit:
- Créer un extension attribute dans Azure AD avec les valeurs: agent/supervisor/administrator
- OU utiliser un claim basé sur les groupes avec transformation

**Alternative avec groupes:**
- Créer 3 groupes: "Flex Agents", "Flex Supervisors", "Flex Administrators"
- Ajouter un claim `flex_role` avec transformation selon le groupe

#### Étape 4: SAML Certificates
1. Section **SAML Certificates**
2. Télécharger: **Certificate (Base64)** → C'est votre **X.509 certificate**

#### Étape 5: Set up Twilio Flex
1. Section **Set up Twilio Flex**
2. Copier: **Login URL** → C'est votre **Single sign-on URL**

#### Étape 6: Assigner des utilisateurs
1. **Users and groups** → **Add user/group**
2. Sélectionner utilisateurs
3. Pour chaque utilisateur, s'assurer que:
   - `user.displayname` est renseigné
   - `user.mail` est renseigné
   - L'attribut custom `flex_role` est défini (ou le groupe approprié est assigné)

---

### Option 3: Google Workspace

#### Étape 1: Créer l'application SAML
1. **Google Admin Console** → **Apps** → **Web and mobile apps**
2. Cliquer **Add app** → **Add custom SAML app**

#### Étape 2: App details
- **App name:** Twilio Flex
- **Description:** (optionnel)
- Cliquer **Continue**

#### Étape 3: Google Identity Provider details
- Cette page affiche les métadonnées de Google
- **Télécharger metadata** OU noter:
  - **SSO URL** → C'est votre **Single sign-on URL**
  - **Certificate** → Télécharger → C'est votre **X.509 certificate**
- Cliquer **Continue**

#### Étape 4: Service provider details
- **ACS URL:**
  ```
  https://login.flex.us1.twilio.com/login/callback?connection=JQ5792467d5f2af20b10a4362cf4ec03d3
  ```
- **Entity ID:**
  ```
  urn:flex:JQ5792467d5f2af20b10a4362cf4ec03d3
  ```
- **Start URL (optionnel):**
  ```
  https://flex.twilio.com
  ```
- **Name ID format:** EMAIL
- **Name ID:** Primary email
- Cliquer **Continue**

#### Étape 5: Attribute mapping
Mapper les attributs Google → SAML:

| App attribute | Category | User field |
|---------------|----------|------------|
| `full_name` | Basic Information | First name + Last name |
| `email` | Basic Information | Primary email |
| `flex_role` | Custom Attributes | (créer un attribut custom ou mapper depuis groupe) |

**Pour flex_role:** Vous devez créer un attribut personnalisé ou utiliser une correspondance de groupe:
1. **Directory** → **Users** → **Manage custom attributes**
2. Créer: `flex_role` (type: Text)
3. Assigner la valeur pour chaque utilisateur: `agent`, `supervisor` ou `administrator`

#### Étape 6: Activer pour les utilisateurs
1. **User access** → ON pour tous ou groupes spécifiques
2. Cliquer **Save**

---

### Option 4: Auth0

#### Étape 1: Créer l'application
1. **Auth0 Dashboard** → **Applications** → **Create Application**
2. Name: "Twilio Flex"
3. Type: **Regular Web Application**
4. Cliquer **Create**

#### Étape 2: Configurer SAML
1. **Addons** tab → Activer **SAML2 WEB APP**
2. **Settings:**
```json
{
  "audience": "urn:flex:JQ5792467d5f2af20b10a4362cf4ec03d3",
  "recipient": "https://login.flex.us1.twilio.com/login/callback?connection=JQ5792467d5f2af20b10a4362cf4ec03d3",
  "mappings": {
    "full_name": "name",
    "email": "email",
    "flex_role": "app_metadata.flex_role"
  },
  "nameIdentifierFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
  "nameIdentifierProbes": [
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
  ]
}
```

3. **Usage** tab:
   - Copier: **Identity Provider Login URL** → **Single sign-on URL**
   - Télécharger: **Identity Provider Certificate** → **X.509 certificate**

#### Étape 3: Configurer les utilisateurs
1. **User Management** → **Users**
2. Pour chaque utilisateur:
   - **app_metadata:**
     ```json
     {
       "flex_role": "agent"
     }
     ```

---

## 📤 Informations à me transmettre

Une fois l'application SAML configurée dans votre IdP, fournissez-moi:

### 1. X.509 Certificate (obligatoire)
Format PEM, incluant les lignes BEGIN/END:
```
-----BEGIN CERTIFICATE-----
MIIDpDCCAoygAwIBAgIGAYqK...
[contenu du certificat]
...xYZ123==
-----END CERTIFICATE-----
```

### 2. Single Sign-On URL (obligatoire)
L'URL du endpoint SAML de votre IdP:
```
https://[votre-idp].com/app/[app-id]/sso/saml
```

### 3. Default Redirect URL (optionnel)
URL où rediriger après connexion réussie:
```
https://flex.twilio.com/admin
```

### 4. Trusted URLs (optionnel)
Liste des URLs autorisées pour les redirections:
```
https://flex.twilio.com
https://login.flex.us1.twilio.com
```

---

## ✅ Checklist avant test

- [ ] Application SAML créée dans l'IdP
- [ ] Entity ID et ACS URL configurés correctement
- [ ] NameID format = EmailAddress
- [ ] Les 3 attributs (full_name, email, flex_role) sont mappés
- [ ] Au moins un utilisateur de test assigné avec:
  - full_name renseigné
  - email valide
  - flex_role = agent | supervisor | administrator
- [ ] Certificat X.509 téléchargé
- [ ] SSO URL copié

---

## 🧪 Test de la configuration

Une fois que vous m'aurez fourni le certificat et l'URL SSO:

1. Je configurerai Flex avec ces informations
2. Vous pourrez tester avec: `https://flex.twilio.com/admin`
3. Vous serez redirigé vers votre IdP
4. Après authentification, vous reviendrez sur Flex avec le bon rôle

---

## ⚠️ Notes importantes

### Sécurité
- Assertions SAML doivent être signées (SHA-256 recommandé)
- Configurer l'expiration des assertions (5-10 minutes max)
- Activer l'encryption des assertions si votre politique l'exige

### Synchronisation horaire
- Les serveurs IdP et SP doivent avoir une horloge synchronisée
- Tolérance de skew: ± 2-5 minutes

### WhatsApp pour notifications Flex
- Si vous voulez recevoir les notifications Flex par WhatsApp, le numéro +33661002616 doit être:
  - Vérifié dans Twilio Console
  - Autorisé pour recevoir des messages WhatsApp Business

### Gestion des rôles

**agent:** Utilisateur standard Flex, peut gérer les conversations
**supervisor:** Superviseur, peut voir les métriques d'équipe et gérer les agents
**administrator:** Accès complet, configuration Flex

Vous pouvez mapper ces rôles depuis:
- Des groupes AD/Okta/Google
- Des attributs custom utilisateur
- Des rôles applicatifs

---

## 📞 Besoin d'aide ?

**Quel IdP utilisez-vous ?**
- [ ] Okta
- [ ] Microsoft Azure AD / Entra ID
- [ ] Google Workspace
- [ ] Auth0
- [ ] OneLogin
- [ ] Autre: __________

Indiquez-moi votre IdP et je vous fournirai les captures d'écran exactes et les valeurs précises à renseigner.

---

## 🚀 Prochaines étapes

1. **Configurer l'application SAML** dans votre IdP (suivre le guide ci-dessus)
2. **Me transmettre:**
   - X.509 Certificate (PEM)
   - Single Sign-On URL
   - (Optionnel) Default Redirect URL
   - (Optionnel) Trusted URLs
3. **Je configurerai Flex** avec ces informations
4. **Test SSO** avec un utilisateur de test
5. **Déploiement** en production

---

**Date de création:** 2025-10-17  
**Service:** Twilio Flex JQ5792467d5f2af20b10a4362cf4ec03d3  
**Région:** US1

