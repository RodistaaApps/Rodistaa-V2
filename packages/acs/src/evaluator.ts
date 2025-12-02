/**
 * ACS Rule Evaluator
 * Evaluates rules against events and executes actions
 */

import { Rule, getRules } from './ruleLoader';
import { actionHandlers, getDbAdapter } from './actions';
import { writeAuditEntry, createAuditEntry } from './auditWriter';
import Jexl from 'jexl';
import logger from 'pino';

const log = logger({ name: 'acs-evaluator' });

export type EvalContext = {
  event?: any;
  ctx?: any;
  system?: any;
  db?: any;
  ruleId?: string;
};

export type RuleMatch = {
  ruleId: string;
  rule: Rule;
  matched: boolean;
  evaluationResult?: any;
  actionResults?: any[];
  auditId?: string;
};

export async function defaultActionHandler(actionDef: any, context: EvalContext) {
  const actionKeys = Object.keys(actionDef || {});
  if (actionKeys.length === 0) return { ok: true, info: 'no-op' };

  const results: any[] = [];

  for (const key of actionKeys) {
    const payload = actionDef[key];

    // Resolve JEXL expressions in payload
    const resolvedPayload: any = {};
    for (const k of Object.keys(payload || {})) {
      const v = payload[k];
      if (typeof v === 'string' && v.includes('{{')) {
        try {
          // Replace {{variable}} with JEXL evaluation
          let resolved = v;
          const matches = v.match(/\{\{([^}]+)\}\}/g);
          if (matches) {
            for (const match of matches) {
              const expr = match.replace(/\{\{|\}\}/g, '').trim();
              try {
                const res = await Jexl.eval(expr, context);
                resolved = resolved.replace(match, res);
              } catch {
                // Keep original if evaluation fails
              }
            }
          }
          resolvedPayload[k] = resolved;
        } catch {
          resolvedPayload[k] = payload[k];
        }
      } else {
        resolvedPayload[k] = payload[k];
      }
    }

    // Use action handler if available
    const handler = actionHandlers[key];
    if (handler) {
      try {
        const evalCtx = {
          event: context.event,
          ctx: context.ctx,
          ruleId: context.ruleId,
          db: context.db, // Include db adapter from context
          system: context.system, // Include system config for completeness
        };
        const result = await handler(resolvedPayload, evalCtx);
        results.push(result);
      } catch (error: any) {
        log.error({ error, action: key }, 'Action handler failed');
        results.push({ ok: false, error: error.message, action: key });
      }
    } else {
      log.warn({ action: key }, 'No handler found for action, using stub');
      results.push({ action: key, payload: resolvedPayload, status: 'stub-executed' });
    }
  }

  return results;
}

export async function evaluateRules(
  event: any,
  ctx: any,
  systemConfig: any = {},
  actionHandler = defaultActionHandler,
  dbAdapter?: any
): Promise<RuleMatch[]> {
  const rules = getRules();
  const evalCtx: EvalContext = { event, ctx, system: systemConfig, db: dbAdapter };

  const matched: RuleMatch[] = [];
  let auditId: string | undefined;

  for (const r of rules) {
    try {
      if (!r.compiled) {
        log.warn({ ruleId: r.id }, 'Rule not compiled, skipping');
        continue;
      }

      const res = await r.compiled.eval(evalCtx);

      if (res) {
        log.debug({ ruleId: r.id, severity: r.severity }, 'Rule matched');

        // Pass ruleId to action handler context
        const actionEvalCtx: EvalContext = {
          ...evalCtx,
          ruleId: r.id,
        };

        const actionResults = [];
        for (const ad of r.action || []) {
          const ar = await actionHandler(ad, actionEvalCtx);
          actionResults.push(ar);
        }

        // Create audit entry if rule requires auditing
        if (r.audit) {
          const auditEntry = createAuditEntry(
            'rule',
            r.id,
            'RULE_MATCHED',
            {
              ruleId: r.id,
              severity: r.severity,
              description: r.description,
              eventType: event?.type,
              evaluationResult: res,
            },
            {
              performedBy: ctx?.userId,
              ruleId: r.id,
            }
          );

          auditId = auditEntry.id;
          await writeAuditEntry(auditEntry, dbAdapter || getDbAdapter());
        }

        matched.push({
          ruleId: r.id,
          rule: r,
          matched: true,
          evaluationResult: res,
          actionResults,
          auditId,
        });
      }
    } catch (err: any) {
      log.error({ ruleId: r.id, err }, 'Error evaluating rule');
    }
  }

  return matched;
}

