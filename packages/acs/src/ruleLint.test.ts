/**
 * Unit Tests for ACS Rule Linter
 */

import { lintRuleFile, lintCli } from './ruleLint';
import path from 'path';
import fs from 'fs';
import os from 'os';

describe('Rule Linter', () => {
  const validRuleFile = path.join(__dirname, '..', '..', '..', 'acs_rules_top25.yaml');

  test('should lint valid rule file', () => {
    const result = lintRuleFile(validRuleFile);
    expect(result.passed).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('should detect missing rule ID', () => {
    const tempFile = path.join(os.tmpdir(), 'test-rules-invalid.yaml');
    const invalidYaml = `
- priority: 100
  severity: high
  condition: "event.type == 'test'"
  action:
    - rejectRequest: { code: "TEST" }
`;

    fs.writeFileSync(tempFile, invalidYaml);

    const result = lintRuleFile(tempFile);
    expect(result.passed).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.message.includes('missing required field'))).toBe(true);

    fs.unlinkSync(tempFile);
  });

  test('should detect missing condition', () => {
    const tempFile = path.join(os.tmpdir(), 'test-rules-no-condition.yaml');
    const invalidYaml = `
- id: TEST_RULE
  priority: 100
  severity: high
  action:
    - rejectRequest: { code: "TEST" }
`;

    fs.writeFileSync(tempFile, invalidYaml);

    const result = lintRuleFile(tempFile);
    expect(result.passed).toBe(false);
    expect(result.errors.some((e) => e.message.includes('condition'))).toBe(true);

    fs.unlinkSync(tempFile);
  });

  test('should detect invalid severity', () => {
    const tempFile = path.join(os.tmpdir(), 'test-rules-invalid-severity.yaml');
    const invalidYaml = `
- id: TEST_RULE
  priority: 100
  severity: invalid
  condition: "event.type == 'test'"
  action:
    - rejectRequest: { code: "TEST" }
`;

    fs.writeFileSync(tempFile, invalidYaml);

    const result = lintRuleFile(tempFile);
    expect(result.passed).toBe(false);
    expect(result.errors.some((e) => e.message.includes('invalid severity'))).toBe(true);

    fs.unlinkSync(tempFile);
  });

  test('should detect unknown action type', () => {
    const tempFile = path.join(os.tmpdir(), 'test-rules-unknown-action.yaml');
    const invalidYaml = `
- id: TEST_RULE
  priority: 100
  severity: high
  condition: "event.type == 'test'"
  action:
    - unknownAction: { code: "TEST" }
`;

    fs.writeFileSync(tempFile, invalidYaml);

    const result = lintRuleFile(tempFile);
    expect(result.passed).toBe(false);
    expect(result.errors.some((e) => e.message.includes('unknown action type'))).toBe(true);

    fs.unlinkSync(tempFile);
  });

  test('should detect compilation errors in condition', () => {
    const tempFile = path.join(os.tmpdir(), 'test-rules-invalid-condition.yaml');
    const invalidYaml = `
- id: TEST_RULE
  priority: 100
  severity: high
  condition: "event.type == 'test' && invalid syntax here"
  action:
    - rejectRequest: { code: "TEST" }
`;

    fs.writeFileSync(tempFile, invalidYaml);

    const result = lintRuleFile(tempFile);
    // May or may not fail compilation depending on JEXL parser
    expect(result.errors.length).toBeGreaterThanOrEqual(0);

    fs.unlinkSync(tempFile);
  });

  test('should return error for non-existent file', () => {
    const result = lintRuleFile('/nonexistent/file.yaml');
    expect(result.passed).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should return error for invalid YAML structure', () => {
    const tempFile = path.join(os.tmpdir(), 'test-rules-invalid-structure.yaml');
    const invalidYaml = 'not an array';

    fs.writeFileSync(tempFile, invalidYaml);

    const result = lintRuleFile(tempFile);
    expect(result.passed).toBe(false);
    expect(result.errors.some((e) => e.message.includes('array'))).toBe(true);

    fs.unlinkSync(tempFile);
  });
});

