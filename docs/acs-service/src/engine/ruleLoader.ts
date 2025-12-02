/**
 * acs/ruleLoader.ts
 * - Loads YAML rule files (e.g. acs_rules_top25.yaml)
 * - Compiles condition strings into Jexl expressions
 * - Exposes: loadRules(path), getRules(), watchRules(path, onReload)
 */

import fs from "fs";
import path from "path";
import jsyaml from "js-yaml";
import Jexl, { Expression } from "jexl";
import chokidar from "chokidar";
import logger from "pino";

const log = logger({ name: "ruleLoader" });

export type ActionDef = any;

export type Rule = {
  id: string;
  priority: number;
  severity: string;
  description?: string;
  condition: string; // original string
  compiled?: Expression;
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
      raw: r,
    };

    // compile condition with Jexl
    try {
      rule.compiled = Jexl.compile(rule.condition);
    } catch (err) {
      log.error({ ruleId: rule.id, err }, "Failed to compile rule condition");
      throw err;
    }

    return rule;
  });

  // sort by priority desc for deterministic evaluation
  loaded.sort((a, b) => b.priority - a.priority);
  rules = loaded;

  log.info({ count: rules.length }, "Loaded ACS rules");
  return rules;
}

export function getRules() {
  return rules;
}

/**
 * Watch the file and reload on change. callback receives new rules.
 */
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

