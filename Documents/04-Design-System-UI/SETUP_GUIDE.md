# Rodistaa Primary Project - Setup Guide

**Location**: `C:\Users\devel\Desktop\Rodistaa`  
**Status**: ✅ Ready for Setup

---

## 📋 Prerequisites

### Required Software
- **Node.js**: v20.0.0 or higher
- **pnpm**: v8.0.0 or higher
- **PostgreSQL**: v14.0 or higher
- **Git**: Latest version

### Optional (for full development)
- **Redis**: v7.0 or higher
- **Kafka**: v3.5 or higher
- **Docker**: Latest version

---

## 🚀 Quick Start

### 1. Install Node.js and pnpm

**Install Node.js**:
- Download from: https://nodejs.org/
- Verify: `node --version` (should show v20+)

**Install pnpm**:
```bash
npm install -g pnpm
```
- Verify: `pnpm --version` (should show v8+)

### 2. Clone/Setup Project

```bash
cd C:\Users\devel\Desktop\Rodistaa
```

### 3. Install Dependencies

```bash
pnpm install
```

This will install dependencies for:
- Root workspace
- `packages/utils`
- `backend`

### 4. Set Up Environment Variables

**Backend**:
```bash
cd backend
copy .env.example .env
```

Edit `.env` with your actual values:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Your JWT secret key
- Other service credentials

### 5. Set Up Database

**Prisma Setup**:
```bash
cd services/prisma
pnpm prisma generate
pnpm prisma migrate dev
```

**Note**: Prisma schema is located in the legacy project. You may need to copy or reference it.

### 6. Build Packages

```bash
# From root directory
pnpm build
```

This will build:
- `packages/utils` → `dist/`
- `backend` → `dist/`

### 7. Start Development

**Backend**:
```bash
cd backend
pnpm dev
```

---

## 📁 Project Structure

```
Rodistaa/
├── packages/utils/          # Business logic services
├── backend/                 # NestJS backend
├── docs/                    # Documentation
└── [config files]           # Root configuration
```

---

## 🔧 Development Workflow

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @rodistaa/utils build
pnpm --filter rodistaa-backend build
```

### Type Checking

```bash
# Type check all packages
pnpm typecheck

# Type check specific package
pnpm --filter @rodistaa/utils typecheck
```

### Development Mode

```bash
# Watch mode for utils
pnpm --filter @rodistaa/utils dev

# Watch mode for backend
pnpm --filter rodistaa-backend dev
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @rodistaa/utils test
```

---

## 📝 Environment Variables

### Required Variables

**Backend** (`backend/.env`):
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing key
- `NODE_ENV` - Environment (development/production)

### Optional Variables

- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `KAFKA_BROKERS` - Kafka brokers
- AWS credentials for S3
- SMS/Payment gateway credentials

See `backend/.env.example` for complete list.

---

## 🐛 Troubleshooting

### Issue: `Cannot find module '@rodistaa/utils'`

**Solution**:
```bash
# Rebuild utils package
pnpm --filter @rodistaa/utils build

# Reinstall dependencies
pnpm install
```

### Issue: `DATABASE_URL is required`

**Solution**:
1. Create `backend/.env` from `backend/.env.example`
2. Set `DATABASE_URL` with your PostgreSQL connection string

### Issue: TypeScript errors

**Solution**:
```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

---

## 📚 Next Steps

1. ✅ Complete setup (this guide)
2. 📋 Review business logic services
3. 📋 Set up database schema
4. 📋 Start development!

---

**Setup Complete! Ready for development! ✅**

