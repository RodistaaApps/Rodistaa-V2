/**
 * Unit Tests for ACS Rule Loader
 */

import { loadRulesFromFile, getRules } from './ruleLoader';
import path from 'path';

describe('Rule Loader', () => {
  const ruleFile = path.join(__dirname, '..', '..', '..', 'acs_rules_top25.yaml');

  test('should load rules from YAML file', () => {
    const rules = loadRulesFromFile(ruleFile);
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.length).toBeGreaterThanOrEqual(25);
  });

  test('should compile rule conditions', () => {
    const rules = loadRulesFromFile(ruleFile);
    rules.forEach((rule) => {
      expect(rule.compiled).toBeDefined();
      expect(rule.id).toBeDefined();
      expect(rule.condition).toBeDefined();
    });
  });

  test('should sort rules by priority (descending)', () => {
    const rules = loadRulesFromFile(ruleFile);
    for (let i = 1; i < rules.length; i++) {
      expect(rules[i - 1].priority).toBeGreaterThanOrEqual(rules[i].priority);
    }
  });

  test('should have required fields for each rule', () => {
    const rules = loadRulesFromFile(ruleFile);
    rules.forEach((rule) => {
      expect(rule.id).toBeDefined();
      expect(rule.priority).toBeDefined();
      expect(rule.severity).toBeDefined();
      expect(rule.condition).toBeDefined();
    });
  });

  test('getRules should return loaded rules', () => {
    loadRulesFromFile(ruleFile);
    const rules = getRules();
    expect(rules.length).toBeGreaterThan(0);
  });
});

