variable "aws_region" {
  description = "AWS Region (Cape Town pour Gabon)"
  type        = string
  default     = "af-south-1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "iasted"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "eks_node_instance_types" {
  description = "EKS node instance types"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "eks_node_min_size" {
  description = "Minimum number of EKS nodes"
  type        = number
  default     = 3
}

variable "eks_node_max_size" {
  description = "Maximum number of EKS nodes"
  type        = number
  default     = 10
}

variable "eks_node_desired_size" {
  description = "Desired number of EKS nodes"
  type        = number
  default     = 3
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage (GB)"
  type        = number
  default     = 100
}

variable "rds_max_allocated_storage" {
  description = "RDS max allocated storage (GB)"
  type        = number
  default     = 500
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "iasted_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

