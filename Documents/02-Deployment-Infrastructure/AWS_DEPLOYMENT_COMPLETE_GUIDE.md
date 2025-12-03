# 🚀 AWS DEPLOYMENT - COMPLETE GUIDE

**CTO Production Deployment Strategy**  
**Date**: December 3, 2025  
**Version**: 1.0  
**Status**: ✅ **READY FOR LAUNCH WEEK**

---

## 🎯 Overview

This guide provides **complete AWS deployment configuration** for the Rodistaa platform, including:
- Infrastructure setup (RDS, ElastiCache, S3, ECS)
- Container deployment (Docker + ECS Fargate)
- CI/CD pipeline (GitHub Actions)
- Monitoring & logging
- Security configuration
- One-command deployment

---

## 🏗️ AWS Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        ROUTE 53 (DNS)                        │
│         api.rodistaa.com, admin.rodistaa.com               │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   CLOUDFRONT (CDN)                           │
│              Static Assets Distribution                      │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│            APPLICATION LOAD BALANCER (ALB)                   │
│         SSL Termination + Health Checks                      │
└────────┬──────────────────────────────┬─────────────────────┘
         │                              │
┌────────▼──────┐              ┌────────▼──────┐
│  ECS CLUSTER  │              │  ECS CLUSTER  │
│   (Backend)   │              │   (Portals)   │
│               │              │               │
│ ┌───────────┐ │              │ ┌───────────┐ │
│ │  Fargate  │ │              │ │  Fargate  │ │
│ │   Tasks   │ │              │ │   Tasks   │ │
│ │  (2-10)   │ │              │ │   (2-4)   │ │
│ └───────────┘ │              │ └───────────┘ │
└───────┬───────┘              └───────┬───────┘
        │                              │
┌───────┴──────────────────────────────┴───────┐
│              PRIVATE SUBNET                   │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐│
│  │   RDS    │  │ ElastiCache│  │     S3      ││
│  │PostgreSQL│  │   Redis    │  │   Buckets   ││
│  └──────────┘  └──────────┘  └─────────────┘│
└───────────────────────────────────────────────┘
```

---

## 📦 Services to Deploy

### **1. Backend API** (ECS Fargate)
- **Image**: `rodistaa-backend:latest`
- **Port**: 4000
- **Tasks**: 2-10 (auto-scaling)
- **Memory**: 2GB
- **CPU**: 1vCPU

### **2. Admin Portal** (ECS Fargate)
- **Image**: `rodistaa-admin-portal:latest`
- **Port**: 3000
- **Tasks**: 2-4
- **Memory**: 1GB
- **CPU**: 0.5vCPU

### **3. Franchise Portal** (ECS Fargate)
- **Image**: `rodistaa-franchise-portal:latest`
- **Port**: 3000
- **Tasks**: 2-4
- **Memory**: 1GB
- **CPU**: 0.5vCPU

### **4. PostgreSQL** (AWS RDS)
- **Engine**: PostgreSQL 15
- **Instance**: db.t3.medium
- **Storage**: 100GB (auto-scaling to 500GB)
- **Multi-AZ**: Yes (high availability)
- **Backups**: 30-day retention

### **5. Redis** (AWS ElastiCache)
- **Engine**: Redis 7
- **Node**: cache.t3.micro
- **Replication**: Yes (1 primary + 1 replica)

### **6. Storage** (AWS S3)
- **Buckets**:
  - `rodistaa-prod-documents`
  - `rodistaa-prod-images`
  - `rodistaa-prod-pod`
  - `rodistaa-prod-backups`

---

## 📁 DEPLOYMENT FILES STRUCTURE

```
Rodistaa/
├── infra/
│   ├── terraform/                    # Infrastructure as Code
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── vpc.tf
│   │   ├── rds.tf
│   │   ├── elasticache.tf
│   │   ├── ecs.tf
│   │   ├── alb.tf
│   │   └── s3.tf
│   ├── ecs/
│   │   ├── backend-task-definition.json
│   │   ├── admin-portal-task-definition.json
│   │   └── franchise-portal-task-definition.json
│   └── cloudformation/              # Alternative to Terraform
│       └── rodistaa-stack.yaml
├── docker/
│   ├── Dockerfile.backend           # Backend API
│   ├── Dockerfile.admin-portal      # Admin Portal
│   ├── Dockerfile.franchise-portal  # Franchise Portal
│   └── docker-compose.production.yml
├── scripts/
│   ├── deploy-production.sh         # Main deployment script
│   ├── rollback.sh                  # Rollback script
│   ├── build-images.sh              # Build Docker images
│   └── push-to-ecr.sh               # Push to AWS ECR
├── .github/
│   └── workflows/
│       ├── deploy-production.yml    # Production deployment
│       ├── deploy-staging.yml       # Staging deployment
│       └── pr-validation.yml        # PR checks
└── .env.production.example          # Environment template
```

---

## 🐳 DOCKER IMAGES

### **Backend API Dockerfile**

**Already exists**: `Dockerfile` (production-ready!)

**Key features**:
- ✅ Multi-stage build (optimized)
- ✅ Node.js 18 Alpine (small image)
- ✅ Non-root user (security)
- ✅ Health check included
- ✅ Monorepo-aware

### **Admin Portal Dockerfile**

Create `docker/Dockerfile.admin-portal`:

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS dependencies

RUN npm install -g pnpm@8

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/portal/package.json ./packages/portal/
COPY packages/app-shared/package.json ./packages/app-shared/

RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder

RUN npm install -g pnpm@8

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages

# Build portal
RUN pnpm --filter @rodistaa/portal build

# Stage 3: Production
FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy Next.js production files
COPY --from=builder --chown=nodejs:nodejs /app/packages/portal/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/packages/portal/.next/static ./packages/portal/.next/static
COPY --from=builder --chown=nodejs:nodejs /app/packages/portal/public ./packages/portal/public

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "packages/portal/server.js"]
```

---

## ☁️ AWS INFRASTRUCTURE (Terraform)

### **Main Configuration** (`infra/terraform/main.tf`)

```hcl
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "rodistaa-terraform-state"
    key    = "production/terraform.tfstate"
    region = "ap-south-1"
    encrypt = true
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
    }
  }
}

# VPC Configuration
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr    = "10.0.0.0/16"
  azs         = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
}

# RDS PostgreSQL
module "rds" {
  source = "./modules/rds"
  
  environment         = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  instance_class     = "db.t3.medium"
  allocated_storage  = 100
  multi_az           = true
}

# ElastiCache Redis
module "elasticache" {
  source = "./modules/elasticache"
  
  environment         = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_type          = "cache.t3.micro"
  num_cache_nodes    = 2
}

# S3 Buckets
module "s3" {
  source = "./modules/s3"
  
  environment = var.environment
  buckets     = [
    "documents",
    "images",
    "pod",
    "backups"
  ]
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"
  
  environment         = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids
  
  services = {
    backend = {
      image          = var.backend_image
      port           = 4000
      desired_count  = 2
      cpu            = 1024
      memory         = 2048
    }
    admin_portal = {
      image          = var.admin_portal_image
      port           = 3000
      desired_count  = 2
      cpu            = 512
      memory         = 1024
    }
    franchise_portal = {
      image          = var.franchise_portal_image
      port           = 3000
      desired_count  = 2
      cpu            = 512
      memory         = 1024
    }
  }
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  environment        = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  certificate_arn   = var.ssl_certificate_arn
}
```

---

## 🔧 DEPLOYMENT SCRIPTS

### **Build & Push to ECR** (`scripts/deploy-to-aws.sh`)

```bash
#!/bin/bash
set -euo pipefail

echo "============================================================"
echo "RODISTAA - AWS PRODUCTION DEPLOYMENT"
echo "============================================================"

# Configuration
AWS_REGION="ap-south-1"
AWS_ACCOUNT_ID="YOUR_ACCOUNT_ID"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
VERSION=$(git rev-parse --short HEAD)

# Login to ECR
echo "Step 1: Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Build Backend
echo "Step 2: Building Backend image..."
docker build -t rodistaa-backend:${VERSION} -f Dockerfile .
docker tag rodistaa-backend:${VERSION} ${ECR_REGISTRY}/rodistaa-backend:${VERSION}
docker tag rodistaa-backend:${VERSION} ${ECR_REGISTRY}/rodistaa-backend:latest

# Build Admin Portal
echo "Step 3: Building Admin Portal image..."
docker build -t rodistaa-admin-portal:${VERSION} -f docker/Dockerfile.admin-portal .
docker tag rodistaa-admin-portal:${VERSION} ${ECR_REGISTRY}/rodistaa-admin-portal:${VERSION}
docker tag rodistaa-admin-portal:${VERSION} ${ECR_REGISTRY}/rodistaa-admin-portal:latest

# Build Franchise Portal
echo "Step 4: Building Franchise Portal image..."
docker build -t rodistaa-franchise-portal:${VERSION} -f docker/Dockerfile.franchise-portal .
docker tag rodistaa-franchise-portal:${VERSION} ${ECR_REGISTRY}/rodistaa-franchise-portal:${VERSION}
docker tag rodistaa-franchise-portal:${VERSION} ${ECR_REGISTRY}/rodistaa-franchise-portal:latest

# Push to ECR
echo "Step 5: Pushing images to ECR..."
docker push ${ECR_REGISTRY}/rodistaa-backend:${VERSION}
docker push ${ECR_REGISTRY}/rodistaa-backend:latest
docker push ${ECR_REGISTRY}/rodistaa-admin-portal:${VERSION}
docker push ${ECR_REGISTRY}/rodistaa-admin-portal:latest
docker push ${ECR_REGISTRY}/rodistaa-franchise-portal:${VERSION}
docker push ${ECR_REGISTRY}/rodistaa-franchise-portal:latest

# Update ECS Services
echo "Step 6: Updating ECS services..."
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-backend \
  --force-new-deployment \
  --region ${AWS_REGION}

aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-admin-portal \
  --force-new-deployment \
  --region ${AWS_REGION}

aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-franchise-portal \
  --force-new-deployment \
  --region ${AWS_REGION}

echo ""
echo "============================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "Version: ${VERSION}"
echo "============================================================"
```

---

## 🔄 CI/CD PIPELINE (GitHub Actions)

### **Production Deployment** (`.github/workflows/deploy-production.yml`)

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main
    tags:
      - 'v*.*.*'

env:
  AWS_REGION: ap-south-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.ap-south-1.amazonaws.com

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm@8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test:all

      - name: Build packages
        run: pnpm build:all

  build-and-push:
    name: Build and Push Docker Images
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Get version
        id: version
        run: echo "VERSION=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT

      - name: Build Backend Image
        run: |
          docker build -t rodistaa-backend:${{ steps.version.outputs.VERSION }} -f Dockerfile .
          docker tag rodistaa-backend:${{ steps.version.outputs.VERSION }} \
            ${{ env.ECR_REGISTRY }}/rodistaa-backend:${{ steps.version.outputs.VERSION }}
          docker tag rodistaa-backend:${{ steps.version.outputs.VERSION }} \
            ${{ env.ECR_REGISTRY }}/rodistaa-backend:latest

      - name: Build Admin Portal Image
        run: |
          docker build -t rodistaa-admin-portal:${{ steps.version.outputs.VERSION }} \
            -f docker/Dockerfile.admin-portal .
          docker tag rodistaa-admin-portal:${{ steps.version.outputs.VERSION }} \
            ${{ env.ECR_REGISTRY }}/rodistaa-admin-portal:${{ steps.version.outputs.VERSION }}
          docker tag rodistaa-admin-portal:${{ steps.version.outputs.VERSION }} \
            ${{ env.ECR_REGISTRY }}/rodistaa-admin-portal:latest

      - name: Build Franchise Portal Image
        run: |
          docker build -t rodistaa-franchise-portal:${{ steps.version.outputs.VERSION }} \
            -f docker/Dockerfile.franchise-portal .
          docker tag rodistaa-franchise-portal:${{ steps.version.outputs.VERSION }} \
            ${{ env.ECR_REGISTRY }}/rodistaa-franchise-portal:${{ steps.version.outputs.VERSION }}
          docker tag rodistaa-franchise-portal:${{ steps.version.outputs.VERSION }} \
            ${{ env.ECR_REGISTRY }}/rodistaa-franchise-portal:latest

      - name: Push Images to ECR
        run: |
          docker push ${{ env.ECR_REGISTRY }}/rodistaa-backend:${{ steps.version.outputs.VERSION }}
          docker push ${{ env.ECR_REGISTRY }}/rodistaa-backend:latest
          docker push ${{ env.ECR_REGISTRY }}/rodistaa-admin-portal:${{ steps.version.outputs.VERSION }}
          docker push ${{ env.ECR_REGISTRY }}/rodistaa-admin-portal:latest
          docker push ${{ env.ECR_REGISTRY }}/rodistaa-franchise-portal:${{ steps.version.outputs.VERSION }}
          docker push ${{ env.ECR_REGISTRY }}/rodistaa-franchise-portal:latest

  deploy:
    name: Deploy to ECS
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy Backend
        run: |
          aws ecs update-service \
            --cluster rodistaa-production \
            --service rodistaa-backend \
            --force-new-deployment \
            --region ${{ env.AWS_REGION }}

      - name: Deploy Admin Portal
        run: |
          aws ecs update-service \
            --cluster rodistaa-production \
            --service rodistaa-admin-portal \
            --force-new-deployment \
            --region ${{ env.AWS_REGION }}

      - name: Deploy Franchise Portal
        run: |
          aws ecs update-service \
            --cluster rodistaa-production \
            --service rodistaa-franchise-portal \
            --force-new-deployment \
            --region ${{ env.AWS_REGION }}

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster rodistaa-production \
            --services rodistaa-backend rodistaa-admin-portal rodistaa-franchise-portal \
            --region ${{ env.AWS_REGION }}

      - name: Verify deployment
        run: |
          echo "✅ Deployment complete!"
          echo "Backend: https://api.rodistaa.com/health"
          echo "Admin: https://admin.rodistaa.com"
          echo "Franchise: https://franchise.rodistaa.com"

  notify:
    name: Notify Team
    needs: deploy
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Send Slack Notification
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Rodistaa Production Deployment: ${{ job.status }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Status*: ${{ job.status }}\n*Version*: ${{ github.sha }}\n*Triggered by*: ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 🗄️ DATABASE MIGRATION

### **Production Migration Script** (`scripts/run-migrations-production.sh`)

```bash
#!/bin/bash
set -euo pipefail

echo "============================================================"
echo "RUNNING DATABASE MIGRATIONS ON PRODUCTION"
echo "============================================================"

# Get database credentials from AWS Secrets Manager
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id rodistaa/production/database/password \
  --region ap-south-1 \
  --query SecretString \
  --output text)

DB_HOST=$(aws rds describe-db-instances \
  --db-instance-identifier rodistaa-prod \
  --region ap-south-1 \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

# Export connection string
export DATABASE_URL="postgresql://rodistaa_prod:${DB_PASSWORD}@${DB_HOST}:5432/rodistaa_production?sslmode=require"

# Run migrations
echo "Running migrations..."
cd packages/backend
pnpm migrate up

echo "✅ Migrations complete!"
```

---

## 📊 MONITORING SETUP (AWS)

### **CloudWatch Log Groups**

```bash
# Create log groups
aws logs create-log-group \
  --log-group-name /ecs/rodistaa-backend-production \
  --region ap-south-1

aws logs create-log-group \
  --log-group-name /ecs/rodistaa-admin-portal-production \
  --region ap-south-1

aws logs create-log-group \
  --log-group-name /ecs/rodistaa-franchise-portal-production \
  --region ap-south-1

# Set retention
aws logs put-retention-policy \
  --log-group-name /ecs/rodistaa-backend-production \
  --retention-in-days 30 \
  --region ap-south-1
```

### **CloudWatch Alarms**

```bash
# High CPU Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name rodistaa-backend-high-cpu \
  --alarm-description "Alert when backend CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=ServiceName,Value=rodistaa-backend \
  --region ap-south-1

# High Error Rate Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name rodistaa-backend-high-error-rate \
  --alarm-description "Alert when error rate > 5%" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --region ap-south-1
```

---

## 🔐 SECRETS SETUP

### **Create ECR Repositories**

```bash
# Backend
aws ecr create-repository \
  --repository-name rodistaa-backend \
  --region ap-south-1 \
  --encryption-configuration encryptionType=AES256

# Admin Portal
aws ecr create-repository \
  --repository-name rodistaa-admin-portal \
  --region ap-south-1 \
  --encryption-configuration encryptionType=AES256

# Franchise Portal
aws ecr create-repository \
  --repository-name rodistaa-franchise-portal \
  --region ap-south-1 \
  --encryption-configuration encryptionType=AES256
```

### **GitHub Secrets Required**

Configure these in GitHub Settings → Secrets:

```
AWS_ACCOUNT_ID          # Your AWS account ID
AWS_ACCESS_KEY_ID       # IAM user for CI/CD
AWS_SECRET_ACCESS_KEY   # IAM user secret
SLACK_WEBHOOK_URL       # For deployment notifications
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### **AWS Setup** (One-time)
- [ ] AWS account configured
- [ ] Route53 domain registered
- [ ] SSL certificates created (ACM)
- [ ] ECR repositories created
- [ ] S3 buckets created
- [ ] Secrets created in Secrets Manager
- [ ] CloudWatch log groups created
- [ ] IAM roles configured

### **Infrastructure** (Terraform)
- [ ] VPC created
- [ ] Subnets configured (public + private)
- [ ] Security groups configured
- [ ] RDS instance created
- [ ] ElastiCache cluster created
- [ ] ECS cluster created
- [ ] ALB created with target groups
- [ ] Auto-scaling policies configured

### **Application**
- [ ] All tests passing
- [ ] Docker images build successfully
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Health checks working
- [ ] Monitoring configured

---

## 🚀 DEPLOYMENT WORKFLOW

### **Manual Deployment** (First Time)

```bash
# 1. Set up AWS infrastructure
cd infra/terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# 2. Run database migrations
./scripts/run-migrations-production.sh

# 3. Build and deploy
./scripts/deploy-to-aws.sh

# 4. Verify deployment
curl https://api.rodistaa.com/health
curl https://admin.rodistaa.com
curl https://franchise.rodistaa.com
```

### **Automated Deployment** (After Setup)

```bash
# Just push to main branch
git push origin main

# GitHub Actions will:
# 1. Run tests
# 2. Build Docker images
# 3. Push to ECR
# 4. Deploy to ECS
# 5. Verify health
# 6. Notify team
```

---

## 📋 POST-DEPLOYMENT VERIFICATION

```bash
# 1. Check service health
aws ecs describe-services \
  --cluster rodistaa-production \
  --services rodistaa-backend \
  --region ap-south-1

# 2. Check running tasks
aws ecs list-tasks \
  --cluster rodistaa-production \
  --service-name rodistaa-backend \
  --region ap-south-1

# 3. View logs
aws logs tail /ecs/rodistaa-backend-production \
  --follow \
  --region ap-south-1

# 4. Test API
curl https://api.rodistaa.com/health

# 5. Test Portals
curl https://admin.rodistaa.com
curl https://franchise.rodistaa.com
```

---

## 🔄 ROLLBACK PROCEDURE

```bash
#!/bin/bash
# scripts/rollback-production.sh

# Get previous task definition
PREVIOUS_TASK=$(aws ecs describe-services \
  --cluster rodistaa-production \
  --services rodistaa-backend \
  --query 'services[0].deployments[1].taskDefinition' \
  --output text)

# Rollback
aws ecs update-service \
  --cluster rodistaa-production \
  --service rodistaa-backend \
  --task-definition ${PREVIOUS_TASK} \
  --force-new-deployment \
  --region ap-south-1

echo "✅ Rolled back to: ${PREVIOUS_TASK}"
```

---

## 💰 COST ESTIMATION

### **Monthly AWS Costs** (Production)

```
ECS Fargate (Backend):        $50-100/month (2-4 tasks)
ECS Fargate (Portals):        $40-80/month (2 tasks each)
RDS PostgreSQL (db.t3.medium): $60-80/month
ElastiCache (cache.t3.micro):  $15-20/month
S3 Storage:                    $5-10/month
ALB:                           $25/month
Data Transfer:                 $20-50/month
CloudWatch Logs:               $5-10/month
───────────────────────────────────────────────
TOTAL:                         $220-375/month

With Reserved Instances:       $150-250/month (30% savings)
```

---

## ✅ CTO RECOMMENDATIONS

### **Launch Week (Dec 9-11)**:
1. **Monday**: Deploy infrastructure (Terraform)
2. **Tuesday**: Deploy applications (Docker + ECS)
3. **Wednesday**: Go-live with monitoring

### **Cost Optimization** (Post-Launch):
1. Use Reserved Instances (30% savings)
2. Enable auto-scaling (scale down at night)
3. Use S3 Intelligent-Tiering
4. Optimize Docker images

### **Security**:
1. Enable WAF on ALB
2. Use VPC endpoints
3. Enable GuardDuty
4. Regular security scans

---

**READY FOR AWS DEPLOYMENT! 🚀**

---

*AWS Deployment Guide v1.0*  
*December 3, 2025*  
*AI CTO - Rodistaa Platform*

