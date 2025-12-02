#!/usr/bin/env bash

set -euo pipefail

OUTDIR="rodistaa_acs_bundle"
ZIPNAME="rodistaa_acs_bundle.zip"

echo "Creating files in ./$OUTDIR ..."
rm -rf "$OUTDIR" "$ZIPNAME"
mkdir -p "$OUTDIR"/src/acs
mkdir -p "$OUTDIR"/src/models
mkdir -p "$OUTDIR"/src/services
mkdir -p "$OUTDIR"/src/middleware
mkdir -p "$OUTDIR"/src/routes

cat > "$OUTDIR/package.json" <<'JSON'
{
  "name": "rodistaa-acs-service",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.0",
    "pino": "^8.14.0",
    "jexl": "^3.4.0",
    "js-yaml": "^4.1.0",
    "chokidar": "^3.5.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.5.1",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.5.0",
    "eslint": "^8.48.0",
    "@typescript-eslint/parser": "^6.8.0",
    "@typescript-eslint/eslint-plugin": "^6.8.0"
  }
}
JSON

cat > "$OUTDIR/tsconfig.json" <<'JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
JSON

cat > "$OUTDIR/.env.example" <<'ENV'
PGHOST=localhost
PGPORT=5432
PGUSER=rodistaa
PGPASSWORD=changeme
PGDATABASE=rodistaa_acs
PORT=4000
SERVICE_NAME=rodistaa-acs
RISK_SCORE_THRESHOLD=60
OTP_RETRY_LIMIT=5
ENV

cat > "$OUTDIR/README.md" <<'MD'
Rodistaa ACS - Node.js TypeScript bundle
-----------------------------------------

Contents:
- package.json, tsconfig.json
- SQL migration + seed (rodistaa_acs_migration_and_seed.sql)
- acs_rules_top25.yaml (rules)
- src/ (Node.js TypeScript ACS skeleton)
- README with run instructions

Install:
  npm install

Run dev:
  cp .env.example .env
  # update Postgres creds in .env
  npm run dev

Build:
  npm run build
  npm start

Notes:
- This bundle is a starter skeleton. Replace placeholder hash functions and stubs with production-grade implementations.
- Do not use .env in production; use KMS/Secrets Manager.
MD

cat > "$OUTDIR/rodistaa_acs_migration_and_seed.sql" <<'SQL'
-- ============================================================================
-- Rodistaa ACS — SQL Migration + Seed Data
-- Purpose: create ACS tables (audit_logs, acs_blocks, pod_files, watchlist, users, trucks)
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  role VARCHAR(32) NOT NULL,
  name VARCHAR(200),
  mobile_masked VARCHAR(32),
  kyc_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  is_active BOOLEAN DEFAULT TRUE,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trucks (
  id UUID PRIMARY KEY,
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reg_no VARCHAR(64),
  model_year INT,
  bs_type VARCHAR(16),
  chassis_number VARCHAR(128),
  status VARCHAR(32) DEFAULT 'PENDING_INSPECTION',
  last_inspection_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY,
  source VARCHAR(128) NOT NULL,
  event JSONB NOT NULL,
  rule_id VARCHAR(128),
  rule_version VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT now(),
  prev_hash TEXT,
  hash TEXT NOT NULL,
  signer VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS acs_blocks (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(32) NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  severity VARCHAR(16) NOT NULL,
  scope JSONB,
  expires_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  audit_id UUID REFERENCES audit_logs(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pod_files (
  id UUID PRIMARY KEY,
  shipment_id UUID,
  uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  file_hash TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size_bytes BIGINT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(32) NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  risk_score INTEGER DEFAULT 50,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS override_requests (
  id UUID PRIMARY KEY,
  requester_id UUID REFERENCES users(id),
  target_entity_type VARCHAR(32),
  target_entity_id TEXT,
  rule_id VARCHAR(128),
  justification TEXT,
  evidence JSONB,
  status VARCHAR(32) DEFAULT 'PENDING',
  approver_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_rule_id ON audit_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_acs_blocks_entity ON acs_blocks(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_pod_files_hash ON pod_files(file_hash);
CREATE INDEX IF NOT EXISTS idx_watchlist_entity ON watchlist(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_trucks_operator ON trucks(operator_id);
CREATE INDEX IF NOT EXISTS idx_users_kyc ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_acs_blocks_expires ON acs_blocks(expires_at);

-- seed examples (shortened)
INSERT INTO users (id, role, name, mobile_masked, kyc_status, risk_score, created_at)
VALUES
('11111111-1111-1111-1111-111111111111', 'shipper', 'Acme Industries', '+91-98xxxxxx01', 'VERIFIED', 10, '2025-01-01T08:00:00Z');

COMMIT;
SQL

cat > "$OUTDIR/acs_rules_top25.yaml" <<'YAML'
# acs_rules_top25.yaml (sample / core rules — extend as required)
- id: RF01_KYC_MANDATORY
  priority: 1000
  severity: critical
  description: "Block any transactional action if user KYC is not VERIFIED."
  condition: "ctx.userRole in ['shipper','operator','driver'] && ctx.userKycStatus != 'VERIFIED' && event.type in ['booking.create','bid.create','shipment.start']"
  action:
    - rejectRequest: { code: "KYC_REQUIRED", message: "KYC verification required" }
    - emitEvent: { name: "fraud.flagged", payload: { reason: "KYC_MISSING", userId: "{{ctx.userId}}"} }
  audit: true

- id: RF05_GPS_JUMP_ANOMALY
  priority: 980
  severity: high
  description: "Detect improbable GPS jump (very large distance in short time)."
  condition: "event.type == 'gps.ping' && gps.deltaDistanceKm >= 200 && gps.deltaTimeSec <= 300"
  action:
    - freezeShipment: { shipmentId: "{{shipment.id}}", reason: "GPS_JUMP" }
    - emitEvent: { name: "gps.anomaly.detected", payload: { shipmentId: "{{shipment.id}}", details: "{{gps}}" } }
  audit: true
YAML

# src files (core skeleton)
cat > "$OUTDIR/src/index.ts" <<'TS'
import dotenv from "dotenv";
dotenv.config();

import { createServer } from "./server";
import logger from "pino";

const log = logger({ name: process.env.SERVICE_NAME || "rodistaa-acs" });
const port = Number(process.env.PORT || 4000);

async function main() {
  const app = await createServer();
  app.listen(port, () => {
    log.info(`Rodistaa ACS service running on port ${port}`);
  });
}

main().catch((err) => {
  log.error(err, "Failed to start ACS service");
  process.exit(1);
});
TS

cat > "$OUTDIR/src/server.ts" <<'TS'
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import { acsPreCheck } from "./middleware/acsMiddleware";
import sampleRoutes from "./routes/sampleRoutes";
import logger from "pino";

const log = logger();

export async function createServer() {
  const app = express();
  app.use(morgan("combined"));
  app.use(bodyParser.json({ limit: "5mb" }));

  app.get("/health", (req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

  app.post("/booking/create", acsPreCheck("booking.create"), sampleRoutes.createBooking);
  app.post("/pod/upload", acsPreCheck("pod.uploaded"), sampleRoutes.uploadPod);

  app.get("/acs/blocks/:entityType/:entityId", async (req, res) => {
    const { entityType, entityId } = req.params;
    const { getBlocksByEntity } = await import("./models/acs");
    const blocks = await getBlocksByEntity(entityType, entityId);
    res.json({ blocks });
  });

  return app;
}
TS

cat > "$OUTDIR/src/db/index.ts" <<'TS'
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  max: 20
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

export default pool;
TS

cat > "$OUTDIR/src/models/acs.ts" <<'TS'
import { query } from "../db";
import { v4 as uuidv4 } from "uuid";

export async function insertAudit(audit: any) {
  const id = audit.id || uuidv4();
  const now = new Date().toISOString();
  const hash = "PLACEHOLDER_HASH_" + Date.now();
  await query(
    `INSERT INTO audit_logs (id, source, event, rule_id, rule_version, created_at, prev_hash, hash, signer)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, audit.source || "acs", audit.event || {}, audit.rule_id || null, audit.rule_version || null, now, audit.prev_hash || null, hash, audit.signer || "acs-service"]
  );
  return id;
}

export async function insertBlock(entityType: string, entityId: string, reason: string, severity: string, scope: any, createdBy?: string, auditId?: string) {
  const id = uuidv4();
  const now = new Date().toISOString();
  await query(
    `INSERT INTO acs_blocks (id, entity_type, entity_id, reason, severity, scope, created_by, created_at, audit_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, entityType, entityId, reason, severity, scope ? JSON.stringify(scope) : null, createdBy || null, now, auditId || null]
  );
  return id;
}

export async function getBlocksByEntity(entityType: string, entityId: string) {
  const res = await query(`SELECT * FROM acs_blocks WHERE entity_type=$1 AND entity_id=$2 ORDER BY created_at DESC`, [entityType, entityId]);
  return res.rows;
}

export async function getPodHashes(hash: string) {
  const res = await query(`SELECT * FROM pod_files WHERE file_hash=$1 LIMIT 1`, [hash]);
  return res.rows;
}
TS

cat > "$OUTDIR/src/services/auditService.ts" <<'TS'
import { insertAudit } from "../models/acs";

export async function writeAudit(event: any, ruleId?: string, ruleVersion?: string, signer?: string) {
  const auditPayload = {
    source: "acs",
    event,
    rule_id: ruleId,
    rule_version: ruleVersion,
    signer: signer || "acs-service"
  };
  const id = await insertAudit({ ...auditPayload });
  return id;
}
TS

cat > "$OUTDIR/src/services/acsService.ts" <<'TS'
import { getPodHashes, insertBlock } from "../models/acs";
import { writeAudit } from "./auditService";

export async function quickReject(ctx: any) {
  const { query } = await import("../db");
  const blockCheck = await query(`SELECT * FROM acs_blocks WHERE entity_type IN ($1,$2,$3) AND (entity_id=$4 OR entity_id=$5) LIMIT 1`, ['user','truck','device', ctx.userId, ctx.deviceId]);
  if (blockCheck && blockCheck.rows && blockCheck.rows.length > 0) {
    const r = blockCheck.rows[0];
    return { rejected: true, code: "ENTITY_BLOCKED", message: `${r.entity_type} blocked: ${r.reason}` };
  }
  if (ctx.event && ctx.event.type === "pod.uploaded" && ctx.payload && ctx.payload.fileHash) {
    const dup = await getPodHashes(ctx.payload.fileHash);
    if (dup && dup.length > 0) {
      return { rejected: true, code: "POD_DUPLICATE", message: "POD fileHash already exists" };
    }
  }
  return { rejected: false };
}

export async function enforce(ctx: any) {
  const auditId = await writeAudit({ action: "acs.enforce.request", ctx });

  const qr = await quickReject(ctx);
  if (qr.rejected) {
    await writeAudit({ action: "acs.enforce.decision", decision: qr }, "RF_QUICKREJECT_v1");
    return { allow: false, status: 423, code: qr.code, message: qr.message, context: { auditId } };
  }

  if (ctx.route === "booking.create" && (!ctx.user || ctx.user.kyc_status !== "VERIFIED")) {
    const msg = "KYC_REQUIRED";
    await writeAudit({ action: "acs.enforce.decision", decision: { reason: msg } }, "RF01_KYC_MANDATORY");
    return { allow: false, status: 403, code: msg, message: "KYC verification required", context: { auditId } };
  }

  await writeAudit({ action: "acs.enforce.allow", ctx }, "RF_ALLOW_v1");
  return { allow: true, status: 200, context: { auditId } };
}

export async function createBlock(entityType: string, entityId: string, reason: string, severity = "high", scope?: any, createdBy?: string) {
  const auditId = await writeAudit({ action: "acs.createBlock.request", entityType, entityId, reason, severity, scope }, "RF_BLOCK_v1");
  const id = await insertBlock(entityType, entityId, reason, severity, scope, createdBy, auditId);
  await writeAudit({ action: "acs.createBlock.result", id, entityType, entityId, reason }, "RF_BLOCK_v1");
  return id;
}
TS

cat > "$OUTDIR/src/middleware/acsMiddleware.ts" <<'TS'
import { Request, Response, NextFunction } from "express";
import * as ACS from "../services/acsService";
import logger from "pino";

const log = logger();

export function acsPreCheck(routeName: string) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const ctx: any = {
        userId: req.headers["x-user-id"] as string,
        deviceId: req.headers["x-device-id"] as string,
        ip: req.ip,
        route: routeName,
        payload: req.body,
        headers: req.headers
      };

      if (req.headers["x-user-kyc-status"]) {
        ctx.user = { kyc_status: req.headers["x-user-kyc-status"] };
      }

      const decision = await ACS.enforce(ctx);
      (req as any).acs = decision.context || {};

      if (!decision.allow) {
        log.warn({ route: routeName, reason: decision.code }, "ACS blocked request");
        return res.status(decision.status).json({ code: decision.code, message: decision.message });
      }

      res.setHeader("X-ACS-Audit", decision.context?.auditId || "");
      next();
    } catch (err) {
      log.error(err, "ACS middleware error");
      return res.status(500).json({ code: "ACS_ERROR", message: "ACS processing failed" });
    }
  };
}
TS

cat > "$OUTDIR/src/routes/sampleRoutes.ts" <<'TS'
import { Request, Response } from "express";
import logger from "pino";
const log = logger();

export default {
  async createBooking(req: Request, res: Response) {
    const acsAudit = (req as any).acs;
    log.info({ audit: acsAudit }, "booking.create accepted");
    res.json({ success: true, bookingId: "bk-" + Date.now() });
  },

  async uploadPod(req: Request, res: Response) {
    const { fileHash } = req.body;
    log.info({ fileHash, acs: (req as any).acs }, "pod.uploaded accepted");
    res.json({ success: true, podId: "pod-" + Date.now() });
  }
};
TS

cat > "$OUTDIR/src/acs/ruleLoader.ts" <<'TS'
import fs from "fs";
import path from "path";
import jsyaml from "js-yaml";
import Jexl from "jexl";
import chokidar from "chokidar";
import logger from "pino";

const log = logger({ name: "ruleLoader" });

export type ActionDef = any;

export type Rule = {
  id: string;
  priority: number;
  severity: string;
  description?: string;
  condition: string;
  compiled?: Jexl.Expression;
  action?: ActionDef[];
  audit?: boolean;
  raw?: any;
};

let rules: Rule[] = [];

export function loadRulesFromFile(filePath: string): Rule[] {
  const abs = path.resolve(filePath);
  log.info({ file: abs }, "Loading ACS rule file");
  const raw = fs.readFileSync(abs, "utf8");
  const parsed = jsyaml.load(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Rule file must contain a YAML array of rules");
  }

  const loaded: Rule[] = (parsed as any[]).map((r) => {
    const rule: Rule = {
      id: r.id,
      priority: Number(r.priority || 100),
      severity: r.severity || "medium",
      description: r.description || "",
      condition: r.condition || "false",
      action: r.action || [],
      audit: !!r.audit,
      raw: r
    };
    try {
      rule.compiled = Jexl.compile(rule.condition);
    } catch (err) {
      log.error({ ruleId: rule.id, err }, "Failed to compile rule condition");
      throw err;
    }
    return rule;
  });

  loaded.sort((a, b) => b.priority - a.priority);
  rules = loaded;
  log.info({ count: rules.length }, "Loaded ACS rules");
  return rules;
}

export function getRules() {
  return rules;
}

export function watchRulesFile(filePath: string, onReload?: (r: Rule[]) => void) {
  const abs = path.resolve(filePath);
  const watcher = chokidar.watch(abs, { persistent: true, ignoreInitial: true });
  watcher.on("change", () => {
    try {
      const r = loadRulesFromFile(abs);
      if (onReload) onReload(r);
      log.info("Rules reloaded via watch");
    } catch (err) {
      log.error({ err }, "Error reloading rules");
    }
  });
  return watcher;
}
TS

cat > "$OUTDIR/src/acs/evaluator.ts" <<'TS'
import { Rule, getRules } from "./ruleLoader";
import Jexl from "jexl";
import logger from "pino";

const log = logger({ name: "acs-evaluator" });

export type EvalContext = {
  event?: any;
  ctx?: any;
  system?: any;
  db?: any;
};

export type RuleMatch = {
  ruleId: string;
  rule: Rule;
  matched: boolean;
  evaluationResult?: any;
  actionResults?: any[];
};

export async function defaultActionHandler(actionDef: any, context: EvalContext) {
  const actionKeys = Object.keys(actionDef || {});
  if (actionKeys.length === 0) return { ok: true, info: "no-op" };

  const results: any[] = [];
  for (const key of actionKeys) {
    const payload = actionDef[key];
    const resolvedPayload: any = {};
    for (const k of Object.keys(payload || {})) {
      const v = payload[k];
      if (typeof v === "string") {
        const res = await Jexl.eval(v, context);
        resolvedPayload[k] = res;
      } else {
        resolvedPayload[k] = payload[k];
      }
    }
    log.info({ action: key, payload: resolvedPayload }, "ACTION_EXECUTED (stub)");
    results.push({ action: key, payload: resolvedPayload, status: "stub-executed" });
  }
  return results;
}

export async function evaluateRules(event: any, ctx: any, systemConfig: any = {}, actionHandler = defaultActionHandler): Promise<RuleMatch[]> {
  const rules = getRules();
  const evalCtx = { event, ctx, system: systemConfig };

  const matched: RuleMatch[] = [];

  for (const r of rules) {
    try {
      const res = await r.compiled!.eval(evalCtx);
      if (res) {
        log.debug({ ruleId: r.id, severity: r.severity }, "Rule matched");

        const actionResults = [];
        for (const ad of r.action || []) {
          const ar = await actionHandler(ad, evalCtx);
          actionResults.push(ar);
        }

        matched.push({
          ruleId: r.id,
          rule: r,
          matched: true,
          evaluationResult: res,
          actionResults
        });
      }
    } catch (err) {
      log.error({ ruleId: r.id, err }, "Error evaluating rule");
    }
  }

  return matched;
}
TS

cat > "$OUTDIR/src/acs/actions.ts" <<'TS'
import logger from "pino";
import { createBlock } from "../models/acs";
import { writeAudit } from "../services/auditService";

const log = logger({ name: "acs-actions" });

export async function freezeShipmentAction(payload: any, evalCtx: any) {
  log.info({ payload }, "freezeShipmentAction called (stub)");
  const id = await createBlock("shipment", payload.shipmentId, payload.reason || "freeze", "critical", { source: "ACS" }, evalCtx.ctx?.userId);
  await writeAudit({ action: "freezeShipment", payload, createdBlockId: id }, "ACS_ACTION_v1");
  return { ok: true, blockId: id };
}

export async function blockEntityAction(payload: any, evalCtx: any) {
  const id = await createBlock(payload.entityType, payload.entityId, payload.reason || "blocked", payload.severity || "high", { source: "ACS" }, evalCtx.ctx?.userId);
  await writeAudit({ action: "blockEntity", payload, createdBlockId: id }, "ACS_ACTION_v1");
  return { ok: true, blockId: id };
}

export async function createTicketAction(payload: any, evalCtx: any) {
  log.info({ payload }, "createTicketAction (stub)");
  await writeAudit({ action: "createTicket", payload }, "ACS_ACTION_v1");
  return { ok: true, ticketRef: "TICKET-" + Date.now() };
}

export async function emitEventAction(payload: any, evalCtx: any) {
  log.info({ payload }, "emitEventAction (stub)");
  await writeAudit({ action: "emitEvent", payload }, "ACS_ACTION_v1");
  return { ok: true };
}
TS

cat > "$OUTDIR/src/acs/loaderExample.ts" <<'TS'
import path from "path";
import { loadRulesFromFile, watchRulesFile } from "./ruleLoader";
import { evaluateRules } from "./evaluator";
import * as actions from "./actions";

const RULE_FILE = path.join(__dirname, "..", "..", "acs_rules_top25.yaml");

loadRulesFromFile(RULE_FILE);

watchRulesFile(RULE_FILE, (r) => {
  console.log("rules reloaded, count:", r.length);
});

async function onEvent(event: any, ctx: any) {
  const actionHandler = async (actionDef: any, evalCtx: any) => {
    const key = Object.keys(actionDef)[0];
    const payload = actionDef[key];
    switch (key) {
      case "freezeShipment":
        return actions.freezeShipmentAction(payload, evalCtx);
      case "blockEntity":
        return actions.blockEntityAction(payload, evalCtx);
      case "createTicket":
        return actions.createTicketAction(payload, evalCtx);
      case "emitEvent":
        return actions.emitEventAction(payload, evalCtx);
      default:
        return { ok: true, info: "unknown-action-stub", actionDef };
    }
  };

  const matches = await evaluateRules(event, ctx, {}, actionHandler);
  return matches;
}

(async () => {
  const event = { type: "gps.ping", gps: { deltaDistanceKm: 250, deltaTimeSec: 200 }, shipment: { id: "S-1" } };
  const ctx = { userId: "u-1", deviceId: "dev-1", route: "gps.ping" };
  const result = await onEvent(event, ctx);
  console.log("Result matches:", result.map(m => m.ruleId));
})();
TS

echo "Creating zip $ZIPNAME ..."
zip -r "$ZIPNAME" "$OUTDIR"

echo "Done. Archive: $ZIPNAME"

