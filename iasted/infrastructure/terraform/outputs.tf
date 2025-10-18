output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_security_group_id" {
  description = "EKS cluster security group ID"
  value       = module.eks.cluster_security_group_id
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_instance_endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS port"
  value       = module.rds.db_instance_port
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.elasticache.cache_nodes[0].address
  sensitive   = true
}

output "redis_port" {
  description = "Redis port"
  value       = module.elasticache.cache_nodes[0].port
}

output "s3_artifacts_bucket" {
  description = "S3 artifacts bucket name"
  value       = aws_s3_bucket.artifacts.id
}

output "s3_logs_bucket" {
  description = "S3 logs bucket name"
  value       = aws_s3_bucket.logs.id
}

output "configure_kubectl" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

