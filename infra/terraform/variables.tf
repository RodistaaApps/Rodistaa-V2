variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_password" {
  description = "Database master password (from secrets)"
  type        = string
  sensitive   = true
}

variable "backend_image" {
  description = "Backend Docker image"
  type        = string
  default     = "rodistaa-backend:latest"
}

variable "admin_portal_image" {
  description = "Admin portal Docker image"
  type        = string
  default     = "rodistaa-admin-portal:latest"
}

variable "franchise_portal_image" {
  description = "Franchise portal Docker image"
  type        = string
  default     = "rodistaa-franchise-portal:latest"
}

variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate in ACM"
  type        = string
}

variable "domain_name" {
  description = "Base domain name"
  type        = string
  default     = "rodistaa.com"
}
