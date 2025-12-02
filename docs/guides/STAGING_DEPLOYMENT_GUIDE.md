# 🚀 **STAGING DEPLOYMENT GUIDE**

**Deploy the Rodistaa platform to AWS staging environment**

**Estimated Time**: 1-2 hours (first time), 10 minutes (subsequent)  
**Prerequisites**: AWS account, credentials configured

---

## 📋 **PREREQUISITES**

Before deploying to staging, ensure you have:

- [x] Completed `PRODUCTION_CREDENTIALS_CHECKLIST.md`
- [x] AWS account with IAM user
- [x] GitHub repository with secrets configured
- [x] Terraform installed locally (optional, for manual setup)
- [x] kubectl installed (for verification)
- [x] Docker installed (for building images)

---

## 🎯 **STAGING ENVIRONMENT OVERVIEW**

**Purpose**: Pre-production testing environment

**Infrastructure**:

- **Region**: `ap-south-1` (Mumbai)
- **EKS Cluster**: `rodistaa-staging`
- **Database**: RDS PostgreSQL (db.t3.small)
- **Cache**: ElastiCache Redis (cache.t3.micro)
- **Load Balancer**: Application Load Balancer
- **DNS**: `staging-api.rodistaa.com`

**Cost**: ~$150-200/month

---

## 🏗️ **DEPLOYMENT METHODS**

Choose one of three methods:

### **Method 1: Automatic (Recommended)** ⭐

Push to `develop` branch → GitHub Actions deploys automatically

### **Method 2: Manual via GitHub Actions**

Trigger workflow manually from GitHub UI

### **Method 3: Manual via CLI**

Deploy using Terraform + Helm locally

---

## 🤖 **METHOD 1: AUTOMATIC DEPLOYMENT**

**Simplest method - just push code!**

### **Step 1: Ensure Secrets are Configured**

Go to: GitHub repo → Settings → Secrets and variables → Actions

**Required secrets**:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `STAGING_DATABASE_URL`
- `RAZORPAY_KEY_ID` (test mode)
- `RAZORPAY_KEY_SECRET` (test mode)
- `FIREBASE_SERVICE_ACCOUNT_BASE64`
- `GOOGLE_MAPS_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `JWT_SECRET`
- `ENCRYPTION_KEY`

### **Step 2: Push to Develop Branch**

```bash
cd C:\Users\devel\Desktop\Rodistaa

# Ensure you're on develop branch
git checkout develop

# Pull latest changes
git pull origin develop

# Push (triggers deployment)
git push origin develop
```

### **Step 3: Monitor Deployment**

1. Go to: GitHub repo → Actions tab
2. Find workflow: "Complete CI" or "Deploy to Staging"
3. Click on the running workflow
4. Expand steps to see progress:
   - ✅ Build Docker images
   - ✅ Push to ECR
   - ✅ Deploy to EKS
   - ✅ Run database migrations
   - ✅ Run smoke tests

**Expected duration**: 8-12 minutes

### **Step 4: Verify Deployment**

```bash
# Check health endpoint
curl https://staging-api.rodistaa.com/health

# Expected response:
{
  "status": "ok",
  "environment": "staging",
  "version": "1.0.0"
}
```

---

## 🖱️ **METHOD 2: MANUAL VIA GITHUB ACTIONS**

**Trigger deployment without pushing code**

### **Step 1: Navigate to Actions**

1. Go to: GitHub repo → Actions tab
2. Find workflow: "Deploy to Staging"
3. Click "Run workflow" button (top right)

### **Step 2: Configure Workflow**

- **Branch**: `develop`
- **Environment**: `staging`
- Click "Run workflow"

### **Step 3: Monitor & Verify**

Same as Method 1, Steps 3-4

---

## 💻 **METHOD 3: MANUAL VIA CLI**

**For advanced users or troubleshooting**

### **Prerequisites**:

```bash
# Install Terraform
choco install terraform  # Windows

# Install kubectl
choco install kubernetes-cli

# Install AWS CLI
choco install awscli

# Install Helm
choco install kubernetes-helm
```

### **Step 1: Provision Infrastructure with Terraform**

```bash
cd C:\Users\devel\Desktop\Rodistaa\infra\terraform

# Initialize Terraform
terraform init

# Plan (review changes)
terraform plan -var-file=environments/staging/terraform.tfvars

# Apply (create infrastructure)
terraform apply -var-file=environments/staging/terraform.tfvars

# Enter 'yes' when prompted
```

**This creates**:

- VPC with subnets
- EKS cluster
- RDS PostgreSQL
- ElastiCache Redis
- S3 buckets
- KMS keys
- Security groups
- Load balancers

**Duration**: ~30-45 minutes (first time)

### **Step 2: Configure kubectl**

```bash
# Update kubeconfig
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name rodistaa-staging

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### **Step 3: Build & Push Docker Images**

```bash
cd C:\Users\devel\Desktop\Rodistaa

# Login to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com

# Build backend image
docker build -t rodistaa-backend:staging -f Dockerfile.backend .

# Tag and push
docker tag rodistaa-backend:staging <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/rodistaa-backend:staging
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/rodistaa-backend:staging

# Repeat for ACS and portal
docker build -t rodistaa-acs:staging -f Dockerfile.acs .
docker tag rodistaa-acs:staging <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/rodistaa-acs:staging
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/rodistaa-acs:staging

docker build -t rodistaa-portal:staging -f Dockerfile.portal .
docker tag rodistaa-portal:staging <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/rodistaa-portal:staging
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/rodistaa-portal:staging
```

### **Step 4: Deploy with Helm**

```bash
# Create namespace
kubectl create namespace rodistaa-staging

# Deploy backend
helm upgrade --install rodistaa-backend \
  ./infra/helm/backend \
  --namespace rodistaa-staging \
  --values ./infra/helm/values/staging.yaml \
  --set image.tag=staging \
  --wait

# Deploy ACS
helm upgrade --install rodistaa-acs \
  ./infra/helm/acs \
  --namespace rodistaa-staging \
  --set image.tag=staging \
  --wait

# Deploy portal
helm upgrade --install rodistaa-portal \
  ./infra/helm/portal \
  --namespace rodistaa-staging \
  --set image.tag=staging \
  --wait
```

### **Step 5: Run Database Migrations**

```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pods -n rodistaa-staging -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Run migrations
kubectl exec -n rodistaa-staging $BACKEND_POD -- pnpm run migrate:latest

# Seed demo data (optional for staging)
kubectl exec -n rodistaa-staging $BACKEND_POD -- pnpm run seed
```

### **Step 6: Verify Deployment**

```bash
# Check pods
kubectl get pods -n rodistaa-staging

# Expected output:
NAME                              READY   STATUS    RESTARTS   AGE
rodistaa-backend-xxx              1/1     Running   0          2m
rodistaa-acs-xxx                  1/1     Running   0          2m
rodistaa-portal-xxx               1/1     Running   0          2m

# Check services
kubectl get svc -n rodistaa-staging

# Check ingress
kubectl get ingress -n rodistaa-staging

# Test health endpoint
curl https://staging-api.rodistaa.com/health
```

---

## ✅ **POST-DEPLOYMENT VERIFICATION**

### **1. Health Checks**

```bash
# Backend health
curl https://staging-api.rodistaa.com/health

# API docs
curl https://staging-api.rodistaa.com/docs

# Portal
curl https://staging-portal.rodistaa.com
```

### **2. Database Connectivity**

```bash
# Connect to RDS
psql $STAGING_DATABASE_URL

# Check tables
\dt

# Check user count
SELECT COUNT(*) FROM users;

\q
```

### **3. Redis Connectivity**

```bash
# Test Redis
kubectl exec -n rodistaa-staging $BACKEND_POD -- redis-cli -h $REDIS_HOST PING
# Expected: PONG
```

### **4. S3 Access**

```bash
# List buckets
aws s3 ls | grep rodistaa-staging

# Test upload
echo "test" > test.txt
aws s3 cp test.txt s3://rodistaa-staging-uploads/test.txt
aws s3 rm s3://rodistaa-staging-uploads/test.txt
rm test.txt
```

### **5. Functional Testing**

**Test OTP flow**:

```bash
curl -X POST https://staging-api.rodistaa.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# Expected: {"success": true, "message": "OTP sent"}
```

**Test portal login**:

1. Open: https://staging-portal.rodistaa.com
2. Enter phone: `+919876543210`
3. Click "Send OTP"
4. Enter OTP from SMS (or check logs)
5. Should see dashboard

---

## 🔧 **TROUBLESHOOTING**

### **Issue 1: Pods Not Starting**

```bash
# Check pod status
kubectl describe pod -n rodistaa-staging <pod-name>

# Check logs
kubectl logs -n rodistaa-staging <pod-name>

# Common causes:
# - Image pull errors → Check ECR permissions
# - Environment variables missing → Check secrets
# - Database connection failure → Check RDS security group
```

### **Issue 2: Database Migration Fails**

```bash
# Check migration status
kubectl exec -n rodistaa-staging $BACKEND_POD -- pnpm knex migrate:status

# Rollback and retry
kubectl exec -n rodistaa-staging $BACKEND_POD -- pnpm run migrate:rollback
kubectl exec -n rodistaa-staging $BACKEND_POD -- pnpm run migrate:latest
```

### **Issue 3: Load Balancer Not Accessible**

```bash
# Check ingress
kubectl get ingress -n rodistaa-staging -o yaml

# Check ALB
aws elbv2 describe-load-balancers | grep rodistaa-staging

# Check DNS
nslookup staging-api.rodistaa.com

# Common causes:
# - DNS not propagated → Wait 5-10 minutes
# - Security group blocking traffic → Check port 443
# - Certificate issue → Check ACM certificate
```

### **Issue 4: Environment Variables Not Loading**

```bash
# Check secrets
kubectl get secrets -n rodistaa-staging

# Describe backend deployment
kubectl describe deployment -n rodistaa-staging rodistaa-backend

# Check environment variables
kubectl exec -n rodistaa-staging $BACKEND_POD -- env | grep DATABASE_URL
```

---

## 🔄 **UPDATING STAGING**

### **Update Code Only** (no infrastructure changes):

```bash
# Push to develop branch
git push origin develop

# GitHub Actions will:
# 1. Build new images
# 2. Push to ECR
# 3. Update deployments
# 4. Rolling restart pods
```

### **Update Infrastructure** (Terraform changes):

```bash
cd infra/terraform

# Review changes
terraform plan -var-file=environments/staging/terraform.tfvars

# Apply changes
terraform apply -var-file=environments/staging/terraform.tfvars
```

### **Update Helm Charts**:

```bash
# Pull latest changes
git pull origin develop

# Upgrade deployment
helm upgrade rodistaa-backend \
  ./infra/helm/backend \
  --namespace rodistaa-staging \
  --values ./infra/helm/values/staging.yaml \
  --reuse-values \
  --wait
```

---

## 🗑️ **DESTROYING STAGING**

**⚠️ WARNING: This will delete all data!**

### **Delete Kubernetes Resources**:

```bash
# Delete all resources
helm uninstall rodistaa-backend -n rodistaa-staging
helm uninstall rodistaa-acs -n rodistaa-staging
helm uninstall rodistaa-portal -n rodistaa-staging

# Delete namespace
kubectl delete namespace rodistaa-staging
```

### **Destroy Infrastructure**:

```bash
cd infra/terraform

# Destroy all AWS resources
terraform destroy -var-file=environments/staging/terraform.tfvars

# Enter 'yes' when prompted
```

**This will delete**:

- EKS cluster
- RDS database (with all data!)
- Redis cluster
- Load balancers
- S3 buckets (if empty)
- All other AWS resources

---

## 📊 **STAGING ENVIRONMENT CHECKLIST**

After deployment, verify:

- [ ] All pods running (backend, ACS, portal)
- [ ] Health endpoints responding
- [ ] Database accessible and migrated
- [ ] Redis accessible
- [ ] S3 buckets accessible
- [ ] Load balancer configured
- [ ] DNS resolving correctly
- [ ] SSL certificate valid
- [ ] OTP sending works
- [ ] Payment flow works (test mode)
- [ ] File uploads work
- [ ] Portal accessible
- [ ] API docs accessible
- [ ] Logs flowing to CloudWatch
- [ ] Metrics being collected

---

## 🎯 **NEXT STEPS**

Once staging is deployed and verified:

1. **Run E2E Tests**:

   ```bash
   BASE_URL=https://staging-api.rodistaa.com npx playwright test
   ```

2. **Conduct UAT**: See `UAT_TEST_PLAN.md`

3. **Monitor for 24-48 hours**: Check logs, errors, performance

4. **Fix any issues** found in staging

5. **Tag production release**: See `PRODUCTION_RELEASE_GUIDE.md`

---

## 📚 **USEFUL COMMANDS**

**Check pod logs**:

```bash
kubectl logs -n rodistaa-staging -l app=backend --tail=100 -f
```

**Restart deployment**:

```bash
kubectl rollout restart deployment/rodistaa-backend -n rodistaa-staging
```

**Scale deployment**:

```bash
kubectl scale deployment/rodistaa-backend -n rodistaa-staging --replicas=3
```

**Execute command in pod**:

```bash
kubectl exec -it -n rodistaa-staging $BACKEND_POD -- bash
```

**Port forward (for debugging)**:

```bash
kubectl port-forward -n rodistaa-staging service/rodistaa-backend 4000:4000
```

---

## 🆘 **GETTING HELP**

If deployment fails:

1. Check GitHub Actions logs for error messages
2. Check pod logs: `kubectl logs -n rodistaa-staging <pod-name>`
3. Check pod events: `kubectl describe pod -n rodistaa-staging <pod-name>`
4. Check AWS CloudWatch logs
5. Verify all secrets are configured correctly
6. Check IAM permissions
7. Verify network connectivity (VPC, security groups)

**Next Guide**: `E2E_TEST_EXECUTION_GUIDE.md`
