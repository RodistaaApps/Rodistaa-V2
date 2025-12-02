# Terraform Variables for Rodistaa Platform

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-south-1" # Mumbai
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be staging or production."
  }
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "rodistaa"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
}

variable "eks_version" {
  description = "Kubernetes version for EKS"
  type        = string
  default     = "1.28"
}

variable "eks_node_groups" {
  description = "EKS node group configurations"
  type = map(object({
    desired_size   = number
    min_size       = number
    max_size       = number
    instance_types = list(string)
  }))
  
  default = {
    general = {
      desired_size   = 3
      min_size       = 2
      max_size       = 10
      instance_types = ["t3.large"]
    }
  }
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.small"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 100
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "domain_name" {
  description = "Base domain name"
  type        = string
  default     = "rodistaa.com"
}

variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate in ACM"
  type        = string
  default     = ""
}

# Secrets (should be provided via environment variables or AWS Secrets Manager)
variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "database_password" {
  description = "Master password for RDS"
  type        = string
  sensitive   = true
  default     = ""
}

variable "razorpay_key_id" {
  description = "Razorpay API key ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "razorpay_secret" {
  description = "Razorpay API secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "google_maps_api_key" {
  description = "Google Maps API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "firebase_service_account" {
  description = "Firebase service account JSON"
  type        = string
  sensitive   = true
  default     = ""
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project    = "Rodistaa"
    ManagedBy  = "Terraform"
    CostCenter = "Engineering"
  }
}

