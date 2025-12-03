# Rodistaa Monorepo Bootstrap Script

This script creates a clean, minimal monorepo structure for local development.

## 📋 What It Creates

- **Clean monorepo** at `rodistaa_local_monorepo/`
- **Three packages**:
  - `@rodistaa/app-shared` - Domain types
  - `@rodistaa/backend` - Fastify backend with sample route
  - `@rodistaa/acs` - ACS rule loader
- **Docker Compose** for local Postgres
- **Sample ACS rules** file

## 🚀 Usage

### On Windows (Git Bash or WSL)

```bash
# Navigate to the directory containing the script
cd C:\Users\devel\Desktop\Rodistaa

# Make script executable (Git Bash/WSL)
chmod +x bootstrap_monorepo.sh

# Run the script
./bootstrap_monorepo.sh
```

### On Linux/macOS

```bash
chmod +x bootstrap_monorepo.sh
./bootstrap_monorepo.sh
```

## 📦 After Bootstrap

```bash
# Navigate to the new monorepo
cd rodistaa_local_monorepo

# Install dependencies (requires pnpm)
# If pnpm not installed: npm install -g pnpm
pnpm install

# Start local Postgres
docker-compose up -d

# Run backend
cd packages/backend
pnpm dev

# Run ACS rule loader
cd packages/acs
pnpm dev
```

## 🔧 Requirements

- **pnpm** (install with `npm install -g pnpm`)
- **Docker** (for Postgres)
- **Node.js** >= 20.0.0

## ⚠️ Notes

1. **SQL Migration**: The `init.sql` uses MySQL-style `CREATE DATABASE IF NOT EXISTS`. For PostgreSQL, you may need to adjust:
   ```sql
   -- PostgreSQL version:
   SELECT 'CREATE DATABASE rodistaa_local' 
   WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'rodistaa_local');
   ```

2. **Postgres Connection**: Update `migrate:local` script in `packages/backend/package.json` with your Postgres credentials if different from defaults.

3. **Path to ACS Rules**: The ACS CLI looks for rules at `../../acs_rules_top25.yaml` relative to the built `cli.js`. Adjust the path in `packages/acs/src/cli.ts` if needed.

## 📁 Structure Created

```
rodistaa_local_monorepo/
├── packages/
│   ├── app-shared/      # Domain types
│   ├── backend/         # Fastify backend
│   └── acs/             # ACS rule engine
├── acs_rules_top25.yaml # Sample rules
├── docker-compose.yml   # Postgres setup
├── package.json         # Root workspace config
└── pnpm-workspace.yaml  # Workspace definition
```

---

**Last Updated**: 2025-01-02

