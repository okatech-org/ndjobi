# 🚀 Guide de Déploiement AWS pour iAsted

Guide complet pour déployer iAsted en production sur AWS (région Cape Town - af-south-1).

---

## 📋 Prérequis

### 1. Compte AWS

- ✅ Compte AWS actif
- ✅ Credentials configurés localement
- ✅ Permissions IAM suffisantes (VPC, EKS, RDS, ElastiCache, S3, ECR)

### 2. Outils CLI Installés

```bash
# AWS CLI
brew install awscli
aws configure

# Terraform
brew install terraform

# kubectl
brew install kubectl

# Docker
brew install docker
```

### 3. Vérification

```bash
aws --version          # AWS CLI 2.x
terraform --version    # Terraform 1.6+
kubectl version --client  # kubectl 1.28+
docker --version       # Docker 20+

aws sts get-caller-identity  # Vérifier credentials AWS
```

---

## 🎯 Déploiement Initial (Première Fois)

### Étape 1 : Préparer les Clés API

Obtenir toutes les clés selon le guide `SETUP-API-KEYS.md` :

- ✅ Deepgram API Key
- ✅ OpenAI API Key
- ✅ Anthropic API Key
- ✅ Google AI API Key
- ✅ (Optionnel) Google TTS Service Account JSON
- ✅ (Optionnel) ElevenLabs API Key

### Étape 2 : Lancer le Script de Déploiement

```bash
cd /Users/okatech/ndjobi/iasted/infrastructure/scripts

# Déploiement environnement dev
./deploy-aws.sh dev af-south-1

# OU Déploiement environnement production
./deploy-aws.sh prod af-south-1
```

Le script va :
1. ✅ Vérifier les prérequis (AWS CLI, Terraform, kubectl, Docker)
2. ✅ Créer `terraform.tfvars` avec configuration par défaut
3. ✅ Déployer infrastructure AWS (VPC, EKS, RDS, Redis, S3)
4. ✅ Configurer kubectl pour EKS
5. ✅ Build et push l'image Docker vers ECR
6. ✅ Créer les secrets Kubernetes (vous demandera les clés API)
7. ✅ Déployer les pods sur Kubernetes
8. ✅ Appliquer les migrations de base de données
9. ✅ Afficher le résumé avec endpoints

**Durée estimée** : 20-30 minutes

### Étape 3 : Vérifier le Déploiement

```bash
# Vérifier les pods
kubectl get pods -n iasted

# Vérifier les logs
kubectl logs -f deployment/iasted-api -n iasted

# Vérifier l'HPA (auto-scaling)
kubectl describe hpa iasted-api-hpa -n iasted

# Test health check
kubectl port-forward -n iasted svc/iasted-api 8000:8000
curl http://localhost:8000/health
```

### Étape 4 : Configurer le DNS

1. **Obtenir l'adresse du Load Balancer** :
```bash
kubectl get ingress -n iasted
```

2. **Créer un enregistrement DNS** :
```
Type: CNAME
Nom: api.iasted.ndjobi.ga
Valeur: <ALB-DNS-NAME>.af-south-1.elb.amazonaws.com
```

3. **Attendre propagation DNS** (5-10 minutes)

4. **Tester** :
```bash
curl https://api.iasted.ndjobi.ga/health
```

---

## 🔄 Mise à Jour du Déploiement

Pour déployer une nouvelle version **sans recréer l'infrastructure** :

```bash
cd /Users/okatech/ndjobi/iasted/infrastructure/scripts

# Mise à jour rapide
./update-deployment.sh dev af-south-1
```

Ce script va :
1. ✅ Build une nouvelle image Docker
2. ✅ Push vers ECR avec nouveau tag
3. ✅ Mettre à jour le déploiement Kubernetes
4. ✅ Effectuer un rolling update (zero downtime)

**Durée** : 5-10 minutes

---

## 🗑️ Destruction de l'Infrastructure

⚠️ **ATTENTION : Cette action est IRRÉVERSIBLE !**

Pour supprimer complètement iAsted d'AWS :

```bash
cd /Users/okatech/ndjobi/iasted/infrastructure/scripts

./destroy-aws.sh dev af-south-1
```

Le script va demander une confirmation (tapez `DELETE`).

Ressources supprimées :
- ☸️ Cluster Kubernetes EKS
- 🗄️ Base de données RDS PostgreSQL
- 💾 Cluster Redis ElastiCache
- 📦 Buckets S3 (artifacts, logs)
- 🌐 VPC et sous-réseaux
- 🔐 Security Groups et IAM roles

---

## ⚙️ Configuration Avancée

### Personnaliser terraform.tfvars

Avant de lancer `deploy-aws.sh`, vous pouvez créer manuellement `terraform.tfvars` :

```hcl
# infrastructure/terraform/terraform.tfvars

environment = "prod"
aws_region = "af-south-1"
project_name = "iasted"

# EKS Configuration
eks_node_instance_types = ["t3.large"]    # Plus puissant pour prod
eks_node_min_size = 5                      # Min 5 nodes
eks_node_max_size = 20                     # Max 20 nodes
eks_node_desired_size = 5                  # Démarrer avec 5

# RDS Configuration
rds_instance_class = "db.t3.large"         # Plus de RAM
rds_allocated_storage = 200                # 200 GB
rds_max_allocated_storage = 1000           # Auto-scale jusqu'à 1 TB

# Redis Configuration
redis_node_type = "cache.t3.small"         # Plus de cache

# Credentials
db_username = "iasted_admin"
db_password = "SECURE_PASSWORD_HERE"  # ⚠️ Changer !
```

### Scaling Manuel

#### Scale les Pods

```bash
# Augmenter le nombre de replicas
kubectl scale deployment/iasted-api --replicas=10 -n iasted

# Vérifier
kubectl get pods -n iasted
```

#### Scale les Nodes EKS

Modifier `terraform.tfvars` puis :

```bash
cd infrastructure/terraform
terraform apply
```

---

## 📊 Monitoring Production

### Voir les Métriques Prometheus

```bash
# Port-forward Prometheus
kubectl port-forward -n iasted svc/prometheus 9090:9090

# Ouvrir dans le navigateur
open http://localhost:9090
```

Requêtes utiles :
```promql
# Latence moyenne LLM
avg(llm_latency_seconds)

# Coût total LLM
sum(llm_cost_dollars)

# Connexions WebSocket actives
websocket_connections

# Taux de cache hit
cache_hits_total / (cache_hits_total + cache_misses_total)
```

### Voir les Logs CloudWatch

```bash
# Streamer les logs
aws logs tail /aws/eks/iasted-cluster-prod/cluster --follow --region af-south-1
```

### Dashboard Grafana

Importer les dashboards pré-configurés :

1. Port-forward Grafana :
```bash
kubectl port-forward -n iasted svc/grafana 3000:3000
```

2. Ouvrir http://localhost:3000 (admin/admin)

3. Importer dashboards depuis `infrastructure/grafana/dashboards/`

---

## 🔒 Sécurité Production

### 1. Rotation des Secrets

```bash
# Mettre à jour un secret
kubectl create secret generic iasted-secrets \
    --namespace=iasted \
    --from-literal=deepgram-api-key="NOUVELLE_CLE" \
    --dry-run=client -o yaml | kubectl apply -f -

# Redémarrer les pods pour charger nouveau secret
kubectl rollout restart deployment/iasted-api -n iasted
```

### 2. Activer WAF (Web Application Firewall)

Ajouter dans `terraform/main.tf` :

```hcl
resource "aws_wafv2_web_acl" "iasted" {
  name  = "iasted-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "RateLimitRule"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "iasted-waf"
    sampled_requests_enabled   = true
  }
}
```

### 3. Backup Automatiques

Configurer AWS Backup pour RDS :

```bash
aws backup create-backup-plan --backup-plan '{
  "BackupPlanName": "iasted-daily-backup",
  "Rules": [{
    "RuleName": "DailyBackup",
    "TargetBackupVaultName": "Default",
    "ScheduleExpression": "cron(0 5 * * ? *)",
    "Lifecycle": {
      "DeleteAfterDays": 30
    }
  }]
}'
```

---

## 🧪 Tests Post-Déploiement

### Test 1 : Health Check

```bash
curl https://api.iasted.ndjobi.ga/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "service": "iAsted",
  "version": "v1",
  "environment": "production"
}
```

### Test 2 : WebSocket Vocal

```bash
# Créer une session vocale
curl -X POST https://api.iasted.ndjobi.ga/api/v1/voice/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 3 : Génération Artefact

```bash
curl -X POST https://api.iasted.ndjobi.ga/api/v1/artifacts/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Test Rapport",
    "sections": ["Introduction", "Analyse", "Conclusion"],
    "artifact_type": "pdf_report"
  }'
```

---

## 💰 Optimisation des Coûts

### 1. Utiliser Spot Instances pour EKS

Dans `terraform.tfvars` :

```hcl
eks_node_capacity_type = "SPOT"
eks_node_instance_types = ["t3.medium", "t3a.medium", "t2.medium"]
```

**Économies** : ~70% sur les nodes EKS

### 2. Reserved Instances pour RDS

Pour prod, acheter des Reserved Instances (1-3 ans) :

```bash
aws rds purchase-reserved-db-instances-offering \
  --reserved-db-instances-offering-id <offering-id> \
  --reserved-db-instance-id iasted-rds-reserved
```

**Économies** : ~40-60% sur RDS

### 3. S3 Intelligent-Tiering

Activer auto-archivage des artefacts anciens :

```hcl
resource "aws_s3_bucket_lifecycle_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  rule {
    id     = "archive-old-artifacts"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "INTELLIGENT_TIERING"
    }
  }
}
```

---

## 🆘 Troubleshooting

### Pods en CrashLoopBackOff

```bash
# Voir les logs
kubectl logs -n iasted <pod-name>

# Décrire le pod
kubectl describe pod -n iasted <pod-name>

# Vérifier les secrets
kubectl get secrets -n iasted
```

### RDS Injoignable

```bash
# Vérifier les Security Groups
aws ec2 describe-security-groups --group-ids <rds-sg-id>

# Tester connexion depuis un pod
kubectl run -it --rm debug --image=postgres:16 --restart=Never -n iasted -- \
  psql -h <RDS_ENDPOINT> -U iasted_admin -d iasted_db
```

### Auto-scaling ne fonctionne pas

```bash
# Vérifier HPA
kubectl describe hpa iasted-api-hpa -n iasted

# Vérifier metrics-server
kubectl get deployment metrics-server -n kube-system

# Installer metrics-server si absent
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

## 📚 Ressources Additionnelles

- **Documentation Terraform AWS** : https://registry.terraform.io/providers/hashicorp/aws
- **Documentation EKS** : https://docs.aws.amazon.com/eks
- **Kubernetes Best Practices** : https://kubernetes.io/docs/concepts/
- **AWS Cape Town Region** : https://aws.amazon.com/about-aws/global-infrastructure/regions_az/

---

## ✅ Checklist de Déploiement

- [ ] Compte AWS configuré avec credentials
- [ ] Outils CLI installés (AWS CLI, Terraform, kubectl, Docker)
- [ ] Clés API obtenues (Deepgram, OpenAI, Anthropic, Google)
- [ ] Script `deploy-aws.sh` exécuté avec succès
- [ ] Pods iAsted running (kubectl get pods -n iasted)
- [ ] Health check OK (curl https://api.iasted.ndjobi.ga/health)
- [ ] DNS configuré (CNAME vers ALB)
- [ ] Certificat SSL actif (Let's Encrypt)
- [ ] Monitoring Prometheus/Grafana accessible
- [ ] Backup RDS configuré
- [ ] Tests WebSocket fonctionnels
- [ ] Tests génération artefacts OK
- [ ] Documentation équipe à jour

---

**Déploiement AWS iAsted - Prêt pour la Production** 🚀

