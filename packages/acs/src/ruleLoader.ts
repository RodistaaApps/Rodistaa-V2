/**
 * ACS Rule Loader
 * Loads YAML rules and compiles them to JEXL expressions
 */

import fs from 'fs';
import path from 'path';
import jsyaml from 'js-yaml';
import Jexl from 'jexl';
import logger from 'pino';

const log = logger({ name: 'acs-rule-loader' });

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
  log.info({ file: abs }, 'Loading ACS rule file');
  const raw = fs.readFileSync(abs, 'utf8');
  const parsed = jsyaml.load(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('Rule file must contain a YAML array of rules');
  }

  const loaded: Rule[] = (parsed as any[]).map((r) => {
    const rule: Rule = {
      id: r.id,
      priority: Number(r.priority || 100),
      severity: r.severity || 'medium',
      description: r.description || '',
      condition: r.condition || 'false',
      action: r.action || [],
      audit: !!r.audit,
      raw: r,
    };

    try {
      rule.compiled = Jexl.compile(rule.condition);
    } catch (err) {
      log.error({ ruleId: rule.id, err }, 'Failed to compile rule condition');
      throw err;
    }

    return rule;
  });

  loaded.sort((a, b) => b.priority - a.priority);
  rules = loaded;

  log.info({ count: rules.length }, 'Loaded ACS rules');
  return rules;
}

export function getRules(): Rule[] {
  return rules;
}

/**
 * Watch the file and reload on change. callback receives new rules.
 */
export function watchRulesFile(filePath: string, onReload?: (r: Rule[]) => void) {
  const chokidar = require('chokidar');
  const abs = path.resolve(filePath);
  const watcher = chokidar.watch(abs, { persistent: true, ignoreInitial: true });

  watcher.on('change', () => {
    try {
      const r = loadRulesFromFile(abs);
      if (onReload) onReload(r);
      log.info('Rules reloaded via watch');
    } catch (err) {
      log.error({ err }, 'Error reloading rules');
    }
  });

  return watcher;
}

