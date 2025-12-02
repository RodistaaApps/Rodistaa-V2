# Rodistaa Release Guide

This guide outlines the process for creating and deploying releases of the Rodistaa platform.

---

## Release Process

### 1. Prepare Release

#### Update Version Numbers
```bash
# Update package.json versions
cd packages/backend
npm version patch|minor|major

cd ../acs
npm version patch|minor|major

cd ../app-shared
npm version patch|minor|major
```

#### Update Changelog
Create/update `CHANGELOG.md` with:
- New features
- Bug fixes
- Breaking changes
- Migration guide

### 2. Create Release Branch

```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
```

### 3. Final Testing

```bash
# Run all tests
pnpm -r test

# Run E2E tests
pnpm -r test:e2e

# Lint code
pnpm -r lint

# Build all packages
pnpm -r build

# Test Docker build
docker build -t rodistaa-backend:test .
```

### 4. Create Git Tag

```bash
# Commit version bumps
git add .
git commit -m "chore: bump version to v1.0.0"

# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0

Features:
- Complete backend API
- ACS integration with hardening
- Production-ready Docker images

Bug Fixes:
- Fixed Docker workspace protocol issues
- Fixed ACS function name mismatch
- Optimized production image size

Breaking Changes:
- None
"

# Push tag
git push origin v1.0.0
```

### 5. GitHub Release

The `release.yml` workflow will automatically:
1. Create GitHub release
2. Generate changelog
3. Package release artifacts
4. Upload release ZIP

### 6. Deploy to Staging

```bash
# Trigger staging deployment
gh workflow run deploy.yml -f environment=staging
```

**Verify staging deployment:**
- Health check: `curl https://staging-api.rodistaa.com/health`
- Run smoke tests
- Verify ACS rules loaded

### 7. Deploy to Production

```bash
# Tag must be pushed first
git push origin v1.0.0

# Deployment workflow triggers automatically
# Or trigger manually:
gh workflow run deploy.yml -f environment=production
```

**Post-deployment verification:**
- Health check: `curl https://api.rodistaa.com/health`
- Monitor logs for errors
- Verify metrics dashboard
- Run production smoke tests

---

## Versioning Strategy

We follow **Semantic Versioning** (SemVer):

- **MAJOR** (x.0.0): Breaking changes
- **MINOR** (0.x.0): New features (backward compatible)
- **PATCH** (0.0.x): Bug fixes

### Examples

- `v1.0.0` → `v1.0.1`: Bug fix release
- `v1.0.1` → `v1.1.0`: New feature release
- `v1.1.0` → `v2.0.0`: Breaking change release

---

## Release Checklist

### Pre-Release
- [ ] All tests passing (unit, integration, E2E)
- [ ] No critical linter errors
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version numbers bumped
- [ ] Database migrations tested
- [ ] ACS rules validated

### Release
- [ ] Release branch created
- [ ] Git tag created
- [ ] GitHub release published
- [ ] Docker image built and pushed
- [ ] Deployed to staging
- [ ] Staging tests passed

### Post-Release
- [ ] Deployed to production
- [ ] Production smoke tests passed
- [ ] Monitoring alerts configured
- [ ] Team notified
- [ ] Documentation published

---

## Rollback Strategy

### Quick Rollback (< 5 minutes)

```bash
# Revert to previous version
kubectl rollout undo deployment/rodistaa-backend

# Or deploy previous tag
kubectl set image deployment/rodistaa-backend \
  backend=${{ secrets.CONTAINER_REGISTRY }}/rodistaa-backend:v1.0.0
```

### Database Rollback

```bash
# Rollback migrations
cd packages/backend
pnpm knex migrate:rollback

# Or restore from backup
psql rodistaa_prod < backup_$(date +%Y%m%d).sql
```

### ACS Rule Rollback

```bash
# Disable problematic rule
node packages/acs/dist/scripts/unapply-rule.js <RULE_ID>

# Or revert to previous rules file
git checkout v1.0.0 -- acs_rules_top25.yaml
```

---

## Hotfix Process

### For Critical Production Issues

1. **Create hotfix branch from main**
```bash
git checkout main
git checkout -b hotfix/v1.0.1
```

2. **Apply fix**
```bash
# Make fix
git add .
git commit -m "fix: critical production issue"
```

3. **Test thoroughly**
```bash
pnpm test
pnpm test:e2e
```

4. **Tag and deploy**
```bash
npm version patch
git tag -a v1.0.1 -m "Hotfix: Critical production issue"
git push origin v1.0.1
```

5. **Merge back to develop**
```bash
git checkout develop
git merge hotfix/v1.0.1
git push origin develop
```

---

## Environment-Specific Configuration

### Staging
- **API URL**: `https://staging-api.rodistaa.com`
- **Database**: `rodistaa_staging`
- **KMS**: Local KMS stub
- **Log Level**: `debug`

### Production
- **API URL**: `https://api.rodistaa.com`
- **Database**: `rodistaa_prod`
- **KMS**: AWS KMS (region: ap-south-1)
- **Log Level**: `info`

---

## Monitoring & Alerts

### Health Checks

All environments must respond to:
- `/health` - Basic health check
- `/ready` - Readiness check (DB connection, etc.)
- `/metrics` - Prometheus metrics

### Alerts

Configure alerts for:
- API response time > 500ms
- Error rate > 1%
- Database connection failures
- ACS rule evaluation failures
- Audit log write failures

---

## Release Artifacts

Each release includes:

1. **Docker Image**: `rodistaa-backend:v1.0.0`
2. **Release ZIP**: `rodistaa_release_20250201_v1.0.0.zip`
3. **Changelog**: GitHub release notes
4. **Documentation**: Updated docs in release

---

## Security Considerations

### Before Release
- [ ] Security audit completed
- [ ] Dependencies updated
- [ ] Secrets rotated
- [ ] SSL certificates valid
- [ ] Rate limiting configured

### After Release
- [ ] Monitor for security incidents
- [ ] Review audit logs
- [ ] Check for anomalies

---

## Support

For release-related issues:
- **Slack**: #rodistaa-releases
- **Email**: devops@rodistaa.com
- **On-call**: PagerDuty escalation

---

## Related Documentation

- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `VERIFY.md` - Verification procedures
- `README.md` - Project overview
- `DECISIONS.md` - Technical decisions

---

**Last Updated**: February 1, 2025  
**Current Version**: v1.0.0 (in development)

