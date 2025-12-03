output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis primary endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "s3_bucket_documents" {
  description = "S3 documents bucket name"
  value       = aws_s3_bucket.documents.id
}

output "s3_bucket_images" {
  description = "S3 images bucket name"
  value       = aws_s3_bucket.images.id
}

output "s3_bucket_pod" {
  description = "S3 POD bucket name"
  value       = aws_s3_bucket.pod.id
}

output "s3_bucket_backups" {
  description = "S3 backups bucket name"
  value       = aws_s3_bucket.backups.id
}

