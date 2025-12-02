/**
 * Core ACS service: quickReject, score, enforce.
 * This file contains the orchestration skeleton.
 * Extend condition checks and rule evaluations here or plug-in rule engine.
 */

import { getPodHashes, insertBlock } from "../models/acs";
import { writeAudit } from "./auditService";

export type ACSDecision = {
  allow: boolean;
  status: number;
  code?: string;
  message?: string;
  context?: any;
};

export async function quickReject(ctx: any): Promise<{ rejected: boolean; code?: string; message?: string }> {
  // Quick deterministic checks (fast path)
  // Example: check acs_blocks for user/truck/shipment
  const { query } = await import("../db");

  const blockCheck = await query(
    `SELECT * FROM acs_blocks WHERE entity_type IN ($1,$2,$3) AND (entity_id=$4 OR entity_id=$5) LIMIT 1`,
    ["user", "truck", "device", ctx.userId, ctx.deviceId]
  );

  if (blockCheck && blockCheck.rows && blockCheck.rows.length > 0) {
    const r = blockCheck.rows[0];
    return { rejected: true, code: "ENTITY_BLOCKED", message: `${r.entity_type} blocked: ${r.reason}` };
  }

  // Example: quick POD duplicate detect (if payload contains fileHash)
  if (ctx.event && ctx.event.type === "pod.uploaded" && ctx.payload && ctx.payload.fileHash) {
    const dup = await getPodHashes(ctx.payload.fileHash);
    if (dup && dup.length > 0) {
      return { rejected: true, code: "POD_DUPLICATE", message: "POD fileHash already exists" };
    }
  }

  return { rejected: false };
}

export async function score(ctx: any): Promise<{ level: number; reason?: string }> {
  // Lightweight scoring heuristic — extend using ML/BAE in future
  let score = 10;
  if (ctx.user && ctx.user.risk_score) score = ctx.user.risk_score;

  // bump risk for suspicious endpoints or payloads
  if (ctx.route === "/pod/upload" && ctx.payload && ctx.payload.fileSizeBytes > 25 * 1024 * 1024) {
    score += 40;
  }

  return { level: score };
}

export async function enforce(ctx: any): Promise<ACSDecision> {
  // Full enforcement path. This should call the policy engine in production.
  // Minimal example uses quickReject + simple rules.
  const auditId = await writeAudit({ action: "acs.enforce.request", ctx });

  // quickReject path
  const qr = await quickReject(ctx);
  if (qr.rejected) {
    await writeAudit({ action: "acs.enforce.decision", decision: qr }, "RF_QUICKREJECT_v1");
    return { allow: false, status: 423, code: qr.code, message: qr.message, context: { auditId } };
  }

  // example business rules
  // rule: if event type is booking.create and userKycStatus != VERIFIED
  if (ctx.event && ctx.event.type === "booking.create" && (!ctx.user || ctx.user.kyc_status !== "VERIFIED")) {
    const msg = "KYC_REQUIRED";
    await writeAudit({ action: "acs.enforce.decision", decision: { reason: msg } }, "RF01_KYC_MANDATORY");
    return { allow: false, status: 403, code: msg, message: "KYC verification required", context: { auditId } };
  }

  // allow path: create success audit
  await writeAudit({ action: "acs.enforce.allow", ctx }, "RF_ALLOW_v1");
  return { allow: true, status: 200, context: { auditId } };
}

/**
 * Helper to create block via ACS (used by rules)
 */
export async function createBlock(
  entityType: string,
  entityId: string,
  reason: string,
  severity = "high",
  scope?: any,
  createdBy?: string
) {
  const auditId = await writeAudit(
    { action: "acs.createBlock.request", entityType, entityId, reason, severity, scope },
    "RF_BLOCK_v1"
  );

  const id = await insertBlock(entityType, entityId, reason, severity, scope, createdBy, auditId);

  await writeAudit({ action: "acs.createBlock.result", id, entityType, entityId, reason }, "RF_BLOCK_v1");

  return id;
}

