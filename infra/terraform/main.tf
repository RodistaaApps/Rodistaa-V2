# Rodistaa Platform - Main Terraform Configuration
# AWS Infrastructure for Staging & Production

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }

  backend "s3" {
    bucket         = "rodistaa-terraform-state"
    key            = "platform/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "rodistaa-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Rodistaa"
      ManagedBy   = "Terraform"
      Environment = var.environment
    }
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  environment         = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  
  tags = var.common_tags
}

# EKS Cluster Module
module "eks" {
  source = "./modules/eks"

  environment        = var.environment
  cluster_name       = "${var.project_name}-${var.environment}"
  cluster_version    = var.eks_version
  
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  
  node_groups = var.eks_node_groups
  
  tags = var.common_tags
}

# RDS PostgreSQL Module
module "rds" {
  source = "./modules/rds"

  environment          = var.environment
  identifier           = "${var.project_name}-${var.environment}-db"
  
  engine_version       = "15.4"
  instance_class       = var.rds_instance_class
  allocated_storage    = var.rds_allocated_storage
  
  database_name        = "rodistaa"
  master_username      = "rodistaa_admin"
  
  vpc_id               = module.vpc.vpc_id
  subnet_ids           = module.vpc.database_subnet_ids
  allowed_cidr_blocks  = module.vpc.private_subnet_cidrs
  
  backup_retention_period = var.environment == "production" ? 30 : 7
  multi_az                = var.environment == "production"
  
  tags = var.common_tags
}

# ElastiCache Redis Module
module "redis" {
  source = "./modules/elasticache"

  environment      = var.environment
  cluster_id       = "${var.project_name}-${var.environment}-redis"
  
  node_type        = var.redis_node_type
  num_cache_nodes  = var.environment == "production" ? 3 : 1
  
  vpc_id           = module.vpc.vpc_id
  subnet_ids       = module.vpc.private_subnet_ids
  
  tags = var.common_tags
}

# S3 Buckets Module
module "s3" {
  source = "./modules/s3"

  environment = var.environment
  project     = var.project_name
  
  buckets = {
    kyc_documents = {
      versioning = true
      encryption = "AES256"
      lifecycle_rules = [
        {
          id      = "archive-old-kyc"
          enabled = true
          transition = {
            days          = 90
            storage_class = "GLACIER"
          }
        }
      ]
    }
    pod_documents = {
      versioning = true
      encryption = "AES256"
      lifecycle_rules = [
        {
          id      = "delete-old-pods"
          enabled = true
          expiration = {
            days = 365
          }
        }
      ]
    }
    backups = {
      versioning = true
      encryption = "AES256"
    }
  }
  
  tags = var.common_tags
}

# KMS Keys Module
module "kms" {
  source = "./modules/kms"

  environment = var.environment
  project     = var.project_name
  
  keys = {
    kyc = {
      description = "KYC document encryption"
      rotation    = true
    }
    jwt = {
      description = "JWT token signing"
      rotation    = true
    }
    database = {
      description = "Database encryption at rest"
      rotation    = true
    }
  }
  
  tags = var.common_tags
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"

  environment = var.environment
  name        = "${var.project_name}-${var.environment}-alb"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnet_ids
  
  ssl_certificate_arn = var.ssl_certificate_arn
  
  tags = var.common_tags
}

# Route53 DNS
module "route53" {
  source = "./modules/route53"

  environment = var.environment
  domain_name = var.domain_name
  
  alb_dns_name    = module.alb.dns_name
  alb_zone_id     = module.alb.zone_id
  
  create_records = {
    api     = "api.${var.domain_name}"
    portal  = "portal.${var.domain_name}"
    admin   = "admin.${var.domain_name}"
  }
  
  tags = var.common_tags
}

# Secrets Manager
resource "aws_secretsmanager_secret" "app_secrets" {
  name = "${var.project_name}/${var.environment}/app-secrets"
  description = "Application secrets for Rodistaa platform"
  
  recovery_window_in_days = 30
  
  tags = var.common_tags
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  
  secret_string = jsonencode({
    jwt_secret              = var.jwt_secret
    database_password       = var.database_password
    razorpay_key_id        = var.razorpay_key_id
    razorpay_secret        = var.razorpay_secret
    google_maps_api_key    = var.google_maps_api_key
    firebase_service_account = var.firebase_service_account
  })
}

# Outputs
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  value = module.rds.endpoint
}

output "redis_endpoint" {
  value = module.redis.endpoint
}

output "alb_dns_name" {
  value = module.alb.dns_name
}

output "s3_buckets" {
  value = module.s3.bucket_names
}

