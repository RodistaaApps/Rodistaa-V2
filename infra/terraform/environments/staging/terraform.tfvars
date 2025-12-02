# Staging Environment Configuration

environment = "staging"
aws_region  = "ap-south-1" # Mumbai

# Networking
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["ap-south-1a", "ap-south-1b"]

# EKS
eks_version = "1.28"
eks_node_groups = {
  general = {
    desired_size   = 3
    min_size       = 2
    max_size       = 6
    instance_types = ["t3.medium"]
  }
}

# RDS
rds_instance_class     = "db.t3.small"
rds_allocated_storage  = 50

# Redis
redis_node_type = "cache.t3.micro"

# Domain
domain_name = "staging.rodistaa.com"

# Tags
common_tags = {
  Environment = "staging"
  Project     = "Rodistaa"
  ManagedBy   = "Terraform"
  CostCenter  = "Engineering"
}

