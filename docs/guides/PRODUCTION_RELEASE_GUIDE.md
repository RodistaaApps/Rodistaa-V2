# 🚀 **PRODUCTION RELEASE GUIDE**

**Deploy Rodistaa to production environment**

**Time**: 30-45 minutes  
**Risk Level**: HIGH 🔴  
**Prerequisites**: Staging deployed and tested

---

## ⚠️ **PRE-RELEASE CHECKLIST**

**DO NOT PROCEED** unless ALL items are checked:

- [ ] Staging environment tested for 24-48 hours
- [ ] All E2E tests passing
- [ ] UAT completed and signed off
- [ ] Performance tests meet targets
- [ ] Security audit completed
- [ ] Database backup taken
- [ ] Rollback plan documented
- [ ] Team notified of deployment window
- [ ] Support team on standby
- [ ] Production credentials configured
- [ ] DNS and SSL certificates ready
- [ ] Monitoring and alerting configured

---

## 📅 **DEPLOYMENT WINDOW**

**Recommended timing**:

- **Day**: Tuesday-Thursday (avoid Monday/Friday)
- **Time**: 2:00 AM - 4:00 AM IST (low traffic)
- **Duration**: 1-2 hours with buffer
- **Participants**: DevOps lead, Backend developer, QA lead, Support lead

---

## 🎯 **DEPLOYMENT PROCESS**

### **Method 1: Tag-Based Deployment** (Recommended)

**Step 1: Create Release Tag**

```bash
cd C:\Users\devel\Desktop\Rodistaa

# Ensure on develop branch with latest
git checkout develop
git pull origin develop

# Create release tag
git tag v1.0.0 -m "Release v1.0.0 - Initial production release"

# Push tag (triggers deployment)
git push origin v1.0.0
```

**Step 2: Monitor Deployment**

1. Go to: GitHub → Actions
2. Watch workflow progress:
   - ✅ Build images
   - ✅ Push to ECR
   - ✅ Deploy to staging (validation)
   - ✅ Deploy to production
   - ✅ Run smoke tests

**Duration**: 10-15 minutes

**Step 3: Verify Deployment**

```bash
# Check health
curl https://api.rodistaa.com/health

# Expected:
{
  "status": "ok",
  "environment": "production",
  "version": "1.0.0"
}
```

### **Method 2: Manual Deployment**

**If automated deployment fails**:

```bash
# Login to production EKS
aws eks update-kubeconfig --region ap-south-1 --name rodistaa-production

# Deploy backend
helm upgrade --install rodistaa-backend \
  ./infra/helm/backend \
  --namespace rodistaa-production \
  --values ./infra/helm/values/production.yaml \
  --set image.tag=v1.0.0 \
  --wait --timeout 10m

# Deploy ACS
helm upgrade --install rodistaa-acs \
  ./infra/helm/acs \
  --namespace rodistaa-production \
  --set image.tag=v1.0.0 \
  --wait

# Deploy portal
helm upgrade --install rodistaa-portal \
  ./infra/helm/portal \
  --namespace rodistaa-production \
  --set image.tag=v1.0.0 \
  --wait
```

---

## ✅ **POST-DEPLOYMENT VERIFICATION**

**Execute within 5 minutes of deployment**:

### **1. Health Checks**

```bash
curl https://api.rodistaa.com/health
curl https://api.rodistaa.com/docs
```

### **2. Test Critical Flows**

**OTP Login**:

```bash
curl -X POST https://api.rodistaa.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

**Portal Access**:

- Open: https://app.rodistaa.com
- Login with test account
- Verify dashboard loads

### **3. Monitor Logs**

```bash
kubectl logs -n rodistaa-production -l app=backend --tail=100 -f
```

### **4. Check Metrics**

- Response times
- Error rates
- CPU/Memory usage
- Database connections

### **5. Smoke Test**

```bash
BASE_URL=https://api.rodistaa.com npx playwright test --grep @smoke
```

---

## 🔄 **ROLLBACK PROCEDURE**

**If critical issues detected within 1 hour**:

### **Option 1: Rollback to Previous Version**

```bash
# Find previous version
git tag --sort=-v:refname | head -2

# Rollback to previous tag
kubectl rollout undo deployment/rodistaa-backend -n rodistaa-production
kubectl rollout undo deployment/rodistaa-acs -n rodistaa-production
kubectl rollout undo deployment/rodistaa-portal -n rodistaa-production
```

### **Option 2: Redeploy Previous Tag**

```bash
helm upgrade rodistaa-backend \
  ./infra/helm/backend \
  --namespace rodistaa-production \
  --set image.tag=v0.9.0 \
  --wait
```

### **Option 3: Database Rollback**

```bash
# Only if database migrations were destructive
cd packages/backend
kubectl exec -n rodistaa-production $BACKEND_POD -- pnpm run migrate:rollback
```

---

## 📊 **POST-RELEASE MONITORING**

**Monitor for 24 hours**:

- [ ] Error rates < 0.1%
- [ ] Response times < 200ms (p95)
- [ ] No database connection errors
- [ ] No authentication failures
- [ ] File uploads working
- [ ] Payment processing working
- [ ] Mobile apps connecting
- [ ] No critical logs/alerts

---

## 📢 **COMMUNICATION PLAN**

### **Before Deployment**:

- [ ] Notify all stakeholders 24 hours before
- [ ] Post maintenance window notice
- [ ] Prepare status page update

### **During Deployment**:

- [ ] Update status page: "Maintenance in progress"
- [ ] Post updates in team chat every 15 minutes

### **After Deployment**:

- [ ] Announce successful deployment
- [ ] Update status page: "All systems operational"
- [ ] Send release notes to stakeholders
- [ ] Document any issues encountered

---

## 🎉 **SUCCESS CRITERIA**

Release is considered successful when:

- ✅ All pods running healthy
- ✅ Health checks passing
- ✅ Smoke tests passing
- ✅ Error rate < 0.1%
- ✅ Response times within SLA
- ✅ No critical issues reported
- ✅ User traffic resuming normally
- ✅ Monitoring showing green across all services

---

**Next Steps**: Monitor for 24-48 hours, then proceed with `APP_STORE_SUBMISSION_GUIDE.md`
