#!/usr/bin/env bash

set -euo pipefail

ROOT="$(pwd)/rodistaa_local_monorepo"

echo "Creating monorepo at $ROOT"

rm -rf "$ROOT"

mkdir -p "$ROOT"

cd "$ROOT"

cat > pnpm-workspace.yaml <<'YAML'
packages:
  - 'packages/*'
YAML

# Root package.json
cat > package.json <<'JSON'
{
  "name": "rodistaa-monorepo",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "bootstrap": "pnpm -w install",
    "start:all": "pnpm -w -r -c start",
    "test:all": "pnpm -w -r test"
  }
}
JSON

# Create packages folders
mkdir -p packages/{app-shared,backend,acs}

#####################################
# app-shared: types and id generator
#####################################
mkdir -p packages/app-shared/src

cat > packages/app-shared/package.json <<'JSON'
{
  "name": "@rodistaa/app-shared",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
JSON

cat > packages/app-shared/tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "declaration": true,
    "outDir": "dist",
    "strict": true
  },
  "include": ["src"]
}
JSON

cat > packages/app-shared/src/index.ts <<'TS'
export type Role = 'shipper' | 'operator' | 'driver' | 'admin' | 'franchise';

export interface User {
  id: string; // USR-<role>-<ulid>
  role: Role;
  name: string;
  mobile_masked?: string;
  kyc_status: 'PENDING'|'VERIFIED'|'REJECTED';
  created_at: string;
}

export interface Truck {
  id: string; // TRK-<reg>-<ulid>
  operator_id: string;
  reg_no: string;
  model_year: number;
  bs_type: string;
  status: 'ACTIVE'|'BLOCKED'|'PENDING_INSPECTION'|'EXPIRED_DOCS';
  last_inspection_at?: string;
}

export interface Booking {
  id: string; // RID-YYYYMMDD-xxxx
  shipper_id: string;
  origin: { lat:number, lon:number, address?:string };
  destination: { lat:number, lon:number, address?:string };
  weight_tonnes: number;
  expected_price_min?: number;
  expected_price_max?: number;
  created_at: string;
}
TS

#####################################
# backend: minimal Fastify app + migration folder
#####################################
mkdir -p packages/backend/src packages/backend/migrations

cat > packages/backend/package.json <<'JSON'
{
  "name": "@rodistaa/backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc -p tsconfig.json",
    "migrate:local": "psql -h localhost -p 5432 -U postgres -d rodistaa_local -f migrations/init.sql || true",
    "test": "echo 'no tests yet'"
  },
  "dependencies": {
    "fastify": "^4.24.0",
    "fastify-helmet": "^10.0.0",
    "pg": "^8.11.0",
    "dotenv": "^16.3.1",
    "@rodistaa/app-shared": "workspace:*"
  },
  "devDependencies": {
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.5.0"
  }
}
JSON

cat > packages/backend/tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
JSON

cat > packages/backend/src/index.ts <<'TS'
import Fastify from 'fastify';
import dotenv from 'dotenv';
import { createBookingHandler } from './routes/booking';

dotenv.config();

const server = Fastify({ logger: true });

server.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));
server.post('/booking/create', createBookingHandler);

const port = Number(process.env.PORT || 3000);
server.listen({ port, host:'0.0.0.0' }).then(() => {
  server.log.info('Backend listening on ' + port);
});
TS

cat > packages/backend/src/routes/booking.ts <<'TS'
import { FastifyRequest, FastifyReply } from 'fastify';
export async function createBookingHandler(req: FastifyRequest, reply: FastifyReply) {
  // Minimal validation / mock expected-price call (ChatGPT mocked)
  const payload = req.body as any;
  // Attach mocked estimated price
  const estimated = { min: 12000, max: 16000 };
  return reply.code(201).send({ bookingId: 'RID-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-0001', estimate: estimated });
}
TS

cat > packages/backend/migrations/init.sql <<'SQL'
CREATE DATABASE IF NOT EXISTS rodistaa_local;
\c rodistaa_local
CREATE TABLE IF NOT EXISTS users (id uuid PRIMARY KEY, role text, name text, kyc_status text, created_at timestamptz);
CREATE TABLE IF NOT EXISTS trucks (id uuid PRIMARY KEY, reg_no text, operator_id uuid, status text, last_inspection_at timestamptz);
CREATE TABLE IF NOT EXISTS audit_logs (id uuid PRIMARY KEY, source text, event jsonb, created_at timestamptz);
CREATE TABLE IF NOT EXISTS acs_blocks (id uuid PRIMARY KEY, entity_type text, entity_id text, reason text, severity text, created_at timestamptz);
SQL

#####################################
# acs: rule loader + evaluator (Jexl), demo CLI
#####################################
mkdir -p packages/acs/src

cat > packages/acs/package.json <<'JSON'
{
  "name": "@rodistaa/acs",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/cli.ts",
    "build": "tsc -p tsconfig.json",
    "test": "node dist/cli.js"
  },
  "dependencies": {
    "jexl": "^3.4.0",
    "js-yaml": "^4.1.0",
    "pino": "^8.14.0",
    "@rodistaa/app-shared": "workspace:*"
  },
  "devDependencies": {
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.5.0"
  }
}
JSON

cat > packages/acs/tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
JSON

cat > packages/acs/src/cli.ts <<'TS'
import { loadRulesFromFile } from './ruleLoader';
import path from 'path';

async function main(){
  const rulesPath = path.join(__dirname,'..','..','..','acs_rules_top25.yaml');
  try {
    const rules = loadRulesFromFile(rulesPath);
    console.log('Loaded', rules.length, 'rules. Sample rule ids:', rules.slice(0,5).map(r=>r.id));
  } catch (e) {
    console.error('Failed to load rules', e);
    process.exit(1);
  }
}

main();
TS

cat > packages/acs/src/ruleLoader.ts <<'TS'
import fs from 'fs';
import path from 'path';
import jsyaml from 'js-yaml';
import Jexl from 'jexl';

export type Rule = { id:string, priority:number, severity:string, condition:string, action:any[], audit?:boolean, compiled?:any};

let rules:Rule[] = [];

export function loadRulesFromFile(filePath:string): Rule[] {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs,'utf8');
  const parsed = jsyaml.load(raw);
  if(!Array.isArray(parsed)) throw new Error('Rules must be array');
  rules = (parsed as any[]).map(r=>({ id:r.id, priority:Number(r.priority||100), severity:r.severity||'medium', condition:r.condition||'false', action:r.action||[], audit:!!r.audit }));
  for(const r of rules) r.compiled = Jexl.compile(r.condition);
  rules.sort((a,b)=>b.priority-a.priority);
  return rules;
}

export function getRules(){ return rules; }
TS

# root-level acs_rules_top25.yaml (small sample — expand later)
cat > acs_rules_top25.yaml <<'YAML'
- id: RF01_KYC_MANDATORY
  priority: 1000
  severity: critical
  condition: "ctx.userRole in ['shipper','operator','driver'] && ctx.userKycStatus != 'VERIFIED' && event.type in ['booking.create','bid.create','shipment.start']"
  action:
    - rejectRequest: { code: "KYC_REQUIRED", message: "KYC verification required" }
  audit: true

- id: RF05_GPS_JUMP_ANOMALY
  priority: 980
  severity: high
  condition: "event.type == 'gps.ping' && gps.deltaDistanceKm >= 200 && gps.deltaTimeSec <= 300"
  action:
    - freezeShipment: { shipmentId: "{{shipment.id}}", reason: "GPS_JUMP" }
  audit: true
YAML

# Create .gitignore
cat > .gitignore <<'TXT'
node_modules
dist
.env
TXT

echo "Monorepo skeleton created at $ROOT"
echo "Next steps:"
echo "  1) cd $ROOT"
echo "  2) pnpm install (requires pnpm installed). If pnpm not installed run: npm i -g pnpm"
echo "  3) Run local Postgres (docker-compose) or run 'pnpm -w -r -c start' after you configure DB"
echo "  4) To run ACS rule loader: cd packages/acs && pnpm dev"
echo "  5) To run backend server: cd packages/backend && pnpm dev"

# Create simple docker-compose for local Postgres
cat > docker-compose.yml <<'DOCKER'
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
DOCKER

echo "Bootstrap complete. See README in $ROOT for run instructions."

