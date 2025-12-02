/**
 * ACS Rule Linter
 * 
 * Performs static analysis on ACS rules to detect:
 * - Forbidden functions in conditions
 * - Expression complexity threshold violations
 * - Missing required fields
 * - Invalid action definitions
 */

import fs from 'fs';
import path from 'path';
import jsyaml from 'js-yaml';
import Jexl from 'jexl';
import logger from 'pino';

const log = logger({ name: 'acs-rule-lint' });

export interface LintError {
  ruleId?: string;
  severity: 'error' | 'warning';
  message: string;
  line?: number;
}

export interface LintResult {
  errors: LintError[];
  warnings: LintError[];
  passed: boolean;
}

// Forbidden functions that should not be used in rule conditions
const FORBIDDEN_FUNCTIONS = [
  'eval',
  'Function',
  'setTimeout',
  'setInterval',
  'require',
  'import',
  'exec',
  'spawn',
  // Note: 'system' is allowed as it's used for system.config references
];

// Maximum expression complexity (approximate AST node count)
const MAX_COMPLEXITY = 50;

// Allowed action types
const ALLOWED_ACTIONS = [
  'freezeShipment',
  'blockEntity',
  'createTicket',
  'emitEvent',
  'rejectRequest',
  'flagWatchlist',
  'requireManualReview',
  'redactField',
  'throttle',
  'notifyRole',
  'suspendAccount',
  'proceed', // Internal action for tie-breakers and fallbacks
];

/**
 * Check if expression uses forbidden functions
 */
function checkForbiddenFunctions(condition: string): string[] {
  const found: string[] = [];
  for (const func of FORBIDDEN_FUNCTIONS) {
    // Check for function calls: func( or func. or func[
    const regex = new RegExp(`\\b${func}\\s*\\(|\\b${func}\\.|\\b${func}\\[`, 'i');
    if (regex.test(condition)) {
      found.push(func);
    }
  }
  return found;
}

/**
 * Estimate expression complexity (rough AST node count)
 */
function estimateComplexity(condition: string): number {
  // Count operators, function calls, and nested expressions
  const operators = (condition.match(/[+\-*/%<>=!&|?:]/g) || []).length;
  const functionCalls = (condition.match(/\w+\s*\(/g) || []).length;
  const parentheses = (condition.match(/[()]/g) || []).length;
  const brackets = (condition.match(/[\[\]]/g) || []).length;
  const dots = (condition.match(/\./g) || []).length;

  // Rough estimate: each operator/call adds complexity, nesting multiplies
  return operators + functionCalls + Math.floor(parentheses / 2) + Math.floor(brackets / 2) + dots;
}

/**
 * Validate rule structure
 */
function validateRuleStructure(rule: any, index: number): LintError[] {
  const errors: LintError[] = [];

  if (!rule.id) {
    errors.push({
      severity: 'error',
      message: `Rule at index ${index} is missing required field 'id'`,
      line: index + 1,
    });
  }

  if (!rule.condition) {
    errors.push({
      ruleId: rule.id,
      severity: 'error',
      message: `Rule '${rule.id}' is missing required field 'condition'`,
      line: index + 1,
    });
  }

  if (rule.priority === undefined || rule.priority === null) {
    errors.push({
      ruleId: rule.id,
      severity: 'warning',
      message: `Rule '${rule.id}' should specify a priority (default: 100)`,
      line: index + 1,
    });
  }

  if (!rule.severity) {
    errors.push({
      ruleId: rule.id,
      severity: 'warning',
      message: `Rule '${rule.id}' should specify a severity (default: 'medium')`,
      line: index + 1,
    });
  }

  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (rule.severity && !validSeverities.includes(rule.severity.toLowerCase())) {
    errors.push({
      ruleId: rule.id,
      severity: 'error',
      message: `Rule '${rule.id}' has invalid severity '${rule.severity}'. Must be one of: ${validSeverities.join(', ')}`,
      line: index + 1,
    });
  }

  return errors;
}

/**
 * Validate action definitions
 */
function validateActions(rule: any): LintError[] {
  const errors: LintError[] = [];

  if (!rule.action || !Array.isArray(rule.action)) {
    return errors;
  }

  for (let i = 0; i < rule.action.length; i++) {
    const action = rule.action[i];
    if (typeof action !== 'object' || action === null) {
      errors.push({
        ruleId: rule.id,
        severity: 'error',
        message: `Rule '${rule.id}' has invalid action at index ${i}: must be an object`,
      });
      continue;
    }

    const actionKeys = Object.keys(action);
    if (actionKeys.length === 0) {
      errors.push({
        ruleId: rule.id,
        severity: 'error',
        message: `Rule '${rule.id}' has empty action at index ${i}`,
      });
      continue;
    }

    if (actionKeys.length > 1) {
      errors.push({
        ruleId: rule.id,
        severity: 'warning',
        message: `Rule '${rule.id}' action at index ${i} has multiple keys. Only the first will be used.`,
      });
    }

    const actionType = actionKeys[0];
    if (!ALLOWED_ACTIONS.includes(actionType)) {
      errors.push({
        ruleId: rule.id,
        severity: 'error',
        message: `Rule '${rule.id}' has unknown action type '${actionType}'. Allowed: ${ALLOWED_ACTIONS.join(', ')}`,
      });
    }
  }

  return errors;
}

/**
 * Validate and compile condition
 */
function validateCondition(rule: any): LintError[] {
  const errors: LintError[] = [];

  if (!rule.condition || typeof rule.condition !== 'string') {
    return errors;
  }

  // Check for forbidden functions
  const forbidden = checkForbiddenFunctions(rule.condition);
  if (forbidden.length > 0) {
    errors.push({
      ruleId: rule.id,
      severity: 'error',
      message: `Rule '${rule.id}' condition uses forbidden functions: ${forbidden.join(', ')}`,
    });
  }

  // Check complexity
  const complexity = estimateComplexity(rule.condition);
  if (complexity > MAX_COMPLEXITY) {
    errors.push({
      ruleId: rule.id,
      severity: 'warning',
      message: `Rule '${rule.id}' condition complexity (${complexity}) exceeds threshold (${MAX_COMPLEXITY}). Consider simplifying.`,
    });
  }

  // Try to compile condition
  try {
    Jexl.compile(rule.condition);
  } catch (err: any) {
    errors.push({
      ruleId: rule.id,
      severity: 'error',
      message: `Rule '${rule.id}' condition compilation failed: ${err.message}`,
    });
  }

  return errors;
}

/**
 * Lint a single rule file
 */
export function lintRuleFile(filePath: string): LintResult {
  const errors: LintError[] = [];
  const warnings: LintError[] = [];

  try {
    const abs = path.resolve(filePath);
    log.info({ file: abs }, 'Linting ACS rule file');

    if (!fs.existsSync(abs)) {
      return {
        errors: [{ severity: 'error', message: `File not found: ${abs}` }],
        warnings: [],
        passed: false,
      };
    }

    const raw = fs.readFileSync(abs, 'utf8');
    const parsed = jsyaml.load(raw);

    if (!Array.isArray(parsed)) {
      return {
        errors: [{ severity: 'error', message: 'Rule file must contain a YAML array of rules' }],
        warnings: [],
        passed: false,
      };
    }

    // Validate each rule
    for (let i = 0; i < parsed.length; i++) {
      const rule = parsed[i];

      // Structure validation
      const structureErrors = validateRuleStructure(rule, i);
      structureErrors.forEach((e) => {
        if (e.severity === 'error') errors.push(e);
        else warnings.push(e);
      });

      // Condition validation
      if (rule.condition) {
        const conditionErrors = validateCondition(rule);
        conditionErrors.forEach((e) => {
          if (e.severity === 'error') errors.push(e);
          else warnings.push(e);
        });
      }

      // Action validation
      const actionErrors = validateActions(rule);
      actionErrors.forEach((e) => {
        if (e.severity === 'error') errors.push(e);
        else warnings.push(e);
      });
    }

    log.info(
      { file: abs, errors: errors.length, warnings: warnings.length },
      'Rule linting complete'
    );

    return {
      errors,
      warnings,
      passed: errors.length === 0,
    };
  } catch (error: any) {
    return {
      errors: [{ severity: 'error', message: `Linting failed: ${error.message}` }],
      warnings: [],
      passed: false,
    };
  }
}

/**
 * CLI entry point
 */
export function lintCli(filePath: string): number {
  const result = lintRuleFile(filePath);

  console.log('\n🔍 ACS Rule Linter\n');
  console.log(`File: ${filePath}\n`);

  if (result.errors.length > 0) {
    console.log('❌ Errors:');
    result.errors.forEach((err) => {
      const prefix = err.ruleId ? `[${err.ruleId}] ` : '';
      console.log(`   ${prefix}${err.message}`);
    });
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    result.warnings.forEach((warn) => {
      const prefix = warn.ruleId ? `[${warn.ruleId}] ` : '';
      console.log(`   ${prefix}${warn.message}`);
    });
    console.log();
  }

  if (result.passed && result.warnings.length === 0) {
    console.log('✅ All checks passed!\n');
    return 0;
  } else if (result.passed) {
    console.log('✅ No errors (warnings present)\n');
    return 0;
  } else {
    console.log('❌ Linting failed\n');
    return 1;
  }
}

