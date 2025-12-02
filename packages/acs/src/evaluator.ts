/**
 * ACS Rule Evaluator
 * Evaluates rules against events and executes actions
 */

import { Rule, getRules } from './ruleLoader';
import Jexl from 'jexl';
import logger from 'pino';

const log = logger({ name: 'acs-evaluator' });

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
  if (actionKeys.length === 0) return { ok: true, info: 'no-op' };

  const results: any[] = [];

  for (const key of actionKeys) {
    const payload = actionDef[key];

    const resolvedPayload: any = {};
    for (const k of Object.keys(payload || {})) {
      const v = payload[k];
      if (typeof v === 'string') {
        try {
          const res = await Jexl.eval(v, context);
          resolvedPayload[k] = res;
        } catch {
          resolvedPayload[k] = payload[k];
        }
      } else {
        resolvedPayload[k] = payload[k];
      }
    }

    log.info({ action: key, payload: resolvedPayload }, 'ACTION_EXECUTED (stub)');
    results.push({ action: key, payload: resolvedPayload, status: 'stub-executed' });
  }

  return results;
}

export async function evaluateRules(
  event: any,
  ctx: any,
  systemConfig: any = {},
  actionHandler = defaultActionHandler
): Promise<RuleMatch[]> {
  const rules = getRules();
  const evalCtx: EvalContext = { event, ctx, system: systemConfig };

  const matched: RuleMatch[] = [];

  for (const r of rules) {
    try {
      if (!r.compiled) {
        log.warn({ ruleId: r.id }, 'Rule not compiled, skipping');
        continue;
      }

      const res = await r.compiled.eval(evalCtx);

      if (res) {
        log.debug({ ruleId: r.id, severity: r.severity }, 'Rule matched');

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
          actionResults,
        });
      }
    } catch (err) {
      log.error({ ruleId: r.id, err }, 'Error evaluating rule');
    }
  }

  return matched;
}

