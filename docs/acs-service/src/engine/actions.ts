/**
 * acs/actions.ts
 * - realistic stubs for commonly used actions mapped in YAML (freezeShipment, blockEntity, createTicket, emitEvent, rejectRequest)
 * - in production these call DB/API/event-bus/notification systems
 */

import logger from "pino";
import { insertBlock } from "../models/acs"; // using earlier models
import { writeAudit } from "../services/auditService";

const log = logger({ name: "acs-actions" });

export async function freezeShipmentAction(payload: any, evalCtx: any) {
  // payload: { shipmentId, reason }
  log.info({ payload }, "freezeShipmentAction called (stub)");

  // create acs_blocks entry for shipment
  const id = await insertBlock("shipment", payload.shipmentId, payload.reason || "freeze", "critical", { source: "ACS" }, evalCtx.ctx?.userId);

  await writeAudit({ action: "freezeShipment", payload, createdBlockId: id }, "ACS_ACTION_v1");

  return [{ ok: true, info: "freezeShipment", blockId: id }];
}

export async function blockEntityAction(payload: any, evalCtx: any) {
  // e.g. payload: { entityType: "truck", entityId: "..." , reason: "EXPIRED", severity: "high" }
  const id = await insertBlock(payload.entityType, payload.entityId, payload.reason || "blocked", payload.severity || "high", { source: "ACS" }, evalCtx.ctx?.userId);

  await writeAudit({ action: "blockEntity", payload, createdBlockId: id }, "ACS_ACTION_v1");

  return [{ ok: true, info: "blockEntity", blockId: id }];
}

export async function createTicketAction(payload: any, evalCtx: any) {
  log.info({ payload }, "createTicketAction (stub)");

  // In production: post to ticketing system (Zendesk/Jira) via API
  await writeAudit({ action: "createTicket", payload }, "ACS_ACTION_v1");

  return [{ ok: true, info: "createTicket", ticketRef: "TICKET-" + Date.now() }];
}

export async function emitEventAction(payload: any, evalCtx: any) {
  log.info({ payload }, "emitEventAction (stub)");

  // In production: publish to Kafka/event bus
  await writeAudit({ action: "emitEvent", payload }, "ACS_ACTION_v1");

  return [{ ok: true, info: "emitEvent" }];
}

