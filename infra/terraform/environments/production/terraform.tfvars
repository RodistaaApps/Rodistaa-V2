# Production Environment Configuration

environment = "production"
aws_region  = "ap-south-1" # Mumbai

# Networking
vpc_cidr           = "10.1.0.0/16"
availability_zones = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]

# EKS
eks_version = "1.28"
eks_node_groups = {
  general = {
    desired_size   = 6
    min_size       = 4
    max_size       = 20
    instance_types = ["t3.large"]
  }
  memory_optimized = {
    desired_size   = 2
    min_size       = 2
    max_size       = 8
    instance_types = ["r6i.large"]
  }
}

# RDS
rds_instance_class     = "db.r6i.xlarge" # 4 vCPU, 32GB RAM
rds_allocated_storage  = 500

# Redis
redis_node_type = "cache.r6g.large"

# Domain
domain_name = "rodistaa.com"

# Tags
common_tags = {
  Environment = "production"
  Project     = "Rodistaa"
  ManagedBy   = "Terraform"
  CostCenter  = "Production"
  Compliance  = "Required"
}

