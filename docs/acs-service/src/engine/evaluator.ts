/**
 * acs/evaluator.ts
 * - evaluateRules(event, ctx): returns array of matched rules + action execution results
 * - uses compiled Jexl expressions from ruleLoader
 * - actionHandler is pluggable; default is a stub that returns success results
 *
 * NOTE: keep the evaluation context minimal and sanitized; do not pass raw secrets.
 */

import { Rule, getRules } from "./ruleLoader";
import Jexl from "jexl";
import logger from "pino";

const log = logger({ name: "acs-evaluator" });

// Define the evaluation context shape that rules can reference
export type EvalContext = {
  event?: any;       // the event payload (booking, bid, pod, gps, etc.)
  ctx?: any;         // runtime context (userId, userRole, deviceId, ip, etc.)
  system?: any;      // system config (provided by caller)
  db?: any;          // optionally small lookups (counts/hits) - careful with heavy calls
};

// result types
export type RuleMatch = {
  ruleId: string;
  rule: Rule;
  matched: boolean;
  evaluationResult?: any;
  actionResults?: any[];
};

/**
 * Default action handler. Replace with real action implementations (freezeShipment, blockEntity...)
 * Each action in rule.action list is an object like { freezeShipment: { shipmentId: "{{event.shipmentId}}", reason: "GPS_JUMP" } }
 * We'll evaluate any string templates using Jexl again for simple placeholders.
 */
export async function defaultActionHandler(actionDef: any, context: EvalContext) {
  // simple dispatcher: actionDef has a single key
  const actionKeys = Object.keys(actionDef || {});
  if (actionKeys.length === 0) return { ok: true, info: "no-op" };

  const results: any[] = [];

  for (const key of actionKeys) {
    const payload = actionDef[key];

    // evaluate any string templates in payload (basic)
    const resolvedPayload: any = {};
    for (const k of Object.keys(payload || {})) {
      const v = payload[k];
      if (typeof v === "string") {
        // allow Jexl templating inside braces {{ }}
        const res = await Jexl.eval(v, context);
        resolvedPayload[k] = res;
      } else {
        resolvedPayload[k] = payload[k];
      }
    }

    // stubbed handling - in production, call concrete action functions
    log.info({ action: key, payload: resolvedPayload }, "ACTION_EXECUTED (stub)");
    results.push({ action: key, payload: resolvedPayload, status: "stub-executed" });
  }

  return results;
}

/**
 * Evaluate all rules against event+ctx
 * - returns list of RuleMatch (only rules where condition evaluated true are included)
 * - executes actions sequentially via provided actionHandler (defaultActionHandler)
 */
export async function evaluateRules(event: any, ctx: any, systemConfig: any = {}, actionHandler = defaultActionHandler): Promise<RuleMatch[]> {
  const rules = getRules();

  const evalCtx: EvalContext = { event, ctx, system: systemConfig };

  const matched: RuleMatch[] = [];

  for (const r of rules) {
    try {
      // evaluate compiled Jexl expression; pass evalCtx
      const res = await r.compiled!.eval(evalCtx);

      if (res) {
        log.debug({ ruleId: r.id, severity: r.severity }, "Rule matched");

        // execute actions
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

        // for critical rules you might want to break early (configurable). For now continue to collect matches.
      }
    } catch (err) {
      log.error({ ruleId: r.id, err }, "Error evaluating rule");
      // continue to next rule - but also generate audit log upstream
    }
  }

  return matched;
}

