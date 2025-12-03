terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "rodistaa-terraform-state"
    key            = "production/terraform.tfstate"
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
      Environment = var.environment
      ManagedBy   = "Terraform"
      CostCenter  = "Operations"
    }
  }
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "rodistaa-${var.environment}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "rodistaa-${var.environment}-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = 3
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "rodistaa-${var.environment}-public-${count.index + 1}"
    Type = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "rodistaa-${var.environment}-private-${count.index + 1}"
    Type = "Private"
  }
}

# NAT Gateway (for private subnets)
resource "aws_eip" "nat" {
  domain = "vpc"
  
  tags = {
    Name = "rodistaa-${var.environment}-nat-eip"
  }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  
  tags = {
    Name = "rodistaa-${var.environment}-nat"
  }
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = {
    Name = "rodistaa-${var.environment}-public-rt"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
  
  tags = {
    Name = "rodistaa-${var.environment}-private-rt"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count          = 3
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 3
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# Security Group for ALB
resource "aws_security_group" "alb" {
  name_description = "Security group for Rodistaa ALB"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "rodistaa-${var.environment}-alb-sg"
  }
}

# Security Group for ECS Tasks
resource "aws_security_group" "ecs_tasks" {
  name        = "rodistaa-${var.environment}-ecs-tasks"
  description = "Security group for Rodistaa ECS tasks"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 4000
    to_port         = 4000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "rodistaa-${var.environment}-ecs-tasks-sg"
  }
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "rodistaa-${var.environment}-rds"
  description = "Security group for Rodistaa RDS"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }
  
  tags = {
    Name = "rodistaa-${var.environment}-rds-sg"
  }
}

# Security Group for ElastiCache
resource "aws_security_group" "elasticache" {
  name        = "rodistaa-${var.environment}-elasticache"
  description = "Security group for Rodistaa ElastiCache"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }
  
  tags = {
    Name = "rodistaa-${var.environment}-elasticache-sg"
  }
}

# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "rodistaa-${var.environment}-db-subnet"
  subnet_ids = aws_subnet.private[*].id
  
  tags = {
    Name = "rodistaa-${var.environment}-db-subnet"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "main" {
  identifier           = "rodistaa-${var.environment}"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = var.rds_instance_class
  allocated_storage    = 100
  max_allocated_storage = 500
  storage_encrypted    = true
  
  db_name  = "rodistaa_production"
  username = "rodistaa_prod"
  password = var.db_password  # From secrets
  
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  
  multi_az               = true
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  skip_final_snapshot    = false
  final_snapshot_identifier = "rodistaa-${var.environment}-final-${formatdate("YYYYMMDD-hhmm", timestamp())}"
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  
  tags = {
    Name = "rodistaa-${var.environment}-db"
  }
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "rodistaa-${var.environment}-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
  
  tags = {
    Name = "rodistaa-${var.environment}-cache-subnet"
  }
}

# ElastiCache Redis
resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "rodistaa-${var.environment}"
  replication_group_description = "Rodistaa Redis cluster"
  
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.t3.micro"
  num_cache_clusters   = 2
  parameter_group_name = "default.redis7"
  port                 = 6379
  
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.elasticache.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  automatic_failover_enabled = true
  
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"
  maintenance_window      = "sun:05:00-sun:07:00"
  
  tags = {
    Name = "rodistaa-${var.environment}-redis"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "rodistaa-${var.environment}"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Name = "rodistaa-${var.environment}-cluster"
  }
}

# S3 Buckets
resource "aws_s3_bucket" "documents" {
  bucket = "rodistaa-${var.environment}-documents"
  
  tags = {
    Name = "rodistaa-${var.environment}-documents"
    Type = "Documents"
  }
}

resource "aws_s3_bucket" "images" {
  bucket = "rodistaa-${var.environment}-images"
  
  tags = {
    Name = "rodistaa-${var.environment}-images"
    Type = "Images"
  }
}

resource "aws_s3_bucket" "pod" {
  bucket = "rodistaa-${var.environment}-pod"
  
  tags = {
    Name = "rodistaa-${var.environment}-pod"
    Type = "POD"
  }
}

resource "aws_s3_bucket" "backups" {
  bucket = "rodistaa-${var.environment}-backups"
  
  tags = {
    Name = "rodistaa-${var.environment}-backups"
    Type = "Backups"
  }
}

# S3 Bucket Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "rodistaa-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  
  enable_deletion_protection = true
  
  tags = {
    Name = "rodistaa-${var.environment}-alb"
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/rodistaa-backend-${var.environment}"
  retention_in_days = 30
  
  tags = {
    Name = "rodistaa-backend-logs"
  }
}

resource "aws_cloudwatch_log_group" "admin_portal" {
  name              = "/ecs/rodistaa-admin-portal-${var.environment}"
  retention_in_days = 30
  
  tags = {
    Name = "rodistaa-admin-portal-logs"
  }
}

resource "aws_cloudwatch_log_group" "franchise_portal" {
  name              = "/ecs/rodistaa-franchise-portal-${var.environment}"
  retention_in_days = 30
  
  tags = {
    Name = "rodistaa-franchise-portal-logs"
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}
