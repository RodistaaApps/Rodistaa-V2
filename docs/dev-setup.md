# Development Setup Guide

Complete guide for setting up the Rodistaa platform for local development.

## Prerequisites

- **Node.js**: 20+ (LTS recommended)
- **pnpm**: 8+ (`npm install -g pnpm`)
- **Docker**: Desktop or Engine with Docker Compose
- **Git**: Latest version

## Quick Start

```bash
# 1. Clone repository
git clone <repo-url>
cd Rodistaa

# 2. Copy environment template
cp .env.example .env

# 3. Bootstrap (installs, migrates, seeds)
./dev bootstrap

# 4. Start all services
./dev start

# 5. Verify everything works
./verify-local.sh
```

## Detailed Setup

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local dev):
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret (use strong secret in production)

### 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies for all packages in the monorepo.

### 3. Database Setup

The bootstrap script handles this automatically, but you can do it manually:

```bash
# Start Docker services
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
cd packages/backend
pnpm run migrate:latest

# Seed database
pnpm run seed:run
```

### 4. Start Development Services

```bash
# Start all services
./dev start

# Or start individually:
# Backend
cd packages/backend && pnpm run dev

# Admin Portal
cd packages/portal && PORT=3001 pnpm run dev

# Franchise Portal
cd packages/portal && PORT=3002 pnpm run dev:franchise

# Storybook
cd packages/design-system && pnpm run storybook

# Mocks
cd packages/mocks && pnpm run dev
```

## Development Workflow

### Working on Backend

```bash
cd packages/backend

# Run in watch mode
pnpm run dev

# Run tests
pnpm test

# Run migrations
pnpm run migrate:latest

# Check migration status
pnpm run migrate:status
```

### Working on Portals

```bash
cd packages/portal

# Admin portal (port 3001)
pnpm run dev

# Franchise portal (port 3002)
PORT=3002 pnpm run dev:franchise

# Run tests
pnpm test

# E2E tests
pnpm run test:e2e
```

### Working on Mobile Apps

```bash
cd packages/mobile/shipper  # or operator, driver

# Start Expo
pnpm run start

# Run on iOS simulator
pnpm run ios

# Run on Android emulator
pnpm run android

# Run in web mode
pnpm run web
```

### Working on Design System

```bash
cd packages/design-system

# Start Storybook
pnpm run storybook

# Build tokens
pnpm run tokens:generate

# Run tests
pnpm test

# Visual regression tests
pnpm run test:visual
```

## Project Structure

```
Rodistaa/
├── packages/
│   ├── backend/          # Fastify API server
│   ├── portal/          # Next.js admin & franchise portals
│   ├── mobile/          # React Native mobile apps
│   │   ├── shipper/
│   │   ├── operator/
│   │   └── driver/
│   ├── design-system/   # Shared UI components & tokens
│   ├── mocks/           # Mock external services
│   ├── utils/           # Shared utilities
│   ├── app-shared/      # Shared types & models
│   └── acs/             # Anti-Corruption Shield
├── docker-compose.dev.yml
├── dev                  # Development orchestration script
├── verify-local.sh      # Verification script
└── .env.example         # Environment template
```

## Common Tasks

### Reset Database

```bash
# Clean and reset
./dev clean
./dev bootstrap
```

### View Logs

```bash
# All logs
./dev logs

# Specific service
./dev logs backend
./dev logs admin-portal
```

### Run Tests

```bash
# All tests
pnpm run test:all

# Specific package
cd packages/backend && pnpm test
cd packages/portal && pnpm test
```

### Build for Production

```bash
# Build all packages
pnpm run build:all

# Build specific package
cd packages/backend && pnpm run build
```

## Troubleshooting

### Port Already in Use

```bash
# Find process
lsof -i :4000  # macOS/Linux
netstat -ano | findstr :4000  # Windows

# Kill process or change port in .env
```

### Docker Services Not Starting

```bash
# Check Docker is running
docker ps

# Restart services
docker-compose -f docker-compose.dev.yml restart

# View logs
docker-compose -f docker-compose.dev.yml logs
```

### Database Connection Issues

```bash
# Check Postgres is running
docker ps | grep postgres

# Test connection
psql -h localhost -U postgres -d rodistaa_local

# Reset database
./dev clean
./dev bootstrap
```

### Dependency Issues

```bash
# Clean install
rm -rf node_modules packages/*/node_modules
pnpm install

# Clear pnpm cache
pnpm store prune
```

## Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Commits**: Conventional commits format

```bash
# Format code
pnpm run lint:all --fix

# Type check
pnpm run typecheck:all
```

## Git Workflow

1. Create feature branch: `git checkout -b feat/my-feature`
2. Make changes and commit
3. Push and create PR
4. PR must pass CI checks

**Branch naming:**
- `feat/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation

## Next Steps

- Read `VERIFY_LOCAL.md` for verification steps
- Check `ACTION_REQUIRED.md` for external credentials
- Review package-specific READMEs in `packages/*/README.md`
- Join team Slack for questions

## Support

For issues or questions:
1. Check documentation in `docs/`
2. Review `VERIFY_LOCAL.md` troubleshooting section
3. Check GitHub issues
4. Contact DevOps team

