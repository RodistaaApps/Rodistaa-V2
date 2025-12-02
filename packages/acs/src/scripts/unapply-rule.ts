/**
 * Unapply Rule Script
 * 
 * Disables a rule by moving it to .disabled folder and creates an audit entry.
 * This allows for safe rollback of problematic rules without deleting them.
 */

import fs from 'fs';
import path from 'path';
import { loadRulesFromFile } from '../ruleLoader';
import { createAuditEntry, writeAuditEntry } from '../auditWriter';
import { MockDbAdapter } from '../dbAdapter';

const RULES_FILE = path.join(__dirname, '..', '..', '..', '..', 'acs_rules_top25.yaml');
const DISABLED_DIR = path.join(__dirname, '..', '..', '..', '..', '.disabled', 'rules');

async function main() {
  const args = process.argv.slice(2);
  const ruleId = args[0];

  if (!ruleId || args.includes('--help') || args.includes('-h')) {
    console.log(`
ACS Unapply Rule Script

Usage:
  node unapply-rule.js <ruleId>

Description:
  Disables a rule by moving it to .disabled/rules/ and creates an audit entry.

Example:
  node unapply-rule.js RF05_GPS_JUMP_ANOMALY
    `);
    process.exit(0);
  }

  console.log(`⚠️  Disabling rule: ${ruleId}\n`);

  try {
    // Load rules
    const rules = loadRulesFromFile(RULES_FILE);
    const rule = rules.find((r) => r.id === ruleId);

    if (!rule) {
      console.error(`❌ Rule not found: ${ruleId}`);
      process.exit(1);
    }

    // Create disabled directory if it doesn't exist
    if (!fs.existsSync(DISABLED_DIR)) {
      fs.mkdirSync(DISABLED_DIR, { recursive: true });
    }

    // Read current rules file
    const rulesContent = fs.readFileSync(RULES_FILE, 'utf8');
    const lines = rulesContent.split('\n');
    
    // Find rule block (starts with - id: ruleId)
    let ruleStartIndex = -1;
    let ruleEndIndex = -1;
    let inRuleBlock = false;
    let indentLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim().startsWith('- id:') && line.includes(ruleId)) {
        ruleStartIndex = i;
        inRuleBlock = true;
        indentLevel = line.match(/^(\s*)/)?.[1]?.length || 0;
      } else if (inRuleBlock) {
        // Check if we've reached the next rule or end of file
        if (line.trim().startsWith('- id:') && line.match(/^(\s*)/)?.[1]?.length === indentLevel) {
          ruleEndIndex = i;
          break;
        }
        if (i === lines.length - 1) {
          ruleEndIndex = i + 1;
          break;
        }
      }
    }

    if (ruleStartIndex === -1) {
      console.error(`❌ Could not find rule block in YAML file`);
      process.exit(1);
    }

    if (ruleEndIndex === -1) {
      ruleEndIndex = lines.length;
    }

    // Extract rule block
    const ruleBlock = lines.slice(ruleStartIndex, ruleEndIndex).join('\n');
    
    // Save disabled rule
    const disabledRuleFile = path.join(DISABLED_DIR, `${ruleId}.yaml`);
    fs.writeFileSync(disabledRuleFile, ruleBlock);
    console.log(`✅ Rule moved to .disabled/rules/`);

    // Remove rule from active rules file
    const newLines = [
      ...lines.slice(0, ruleStartIndex),
      ...lines.slice(ruleEndIndex),
    ];
    fs.writeFileSync(RULES_FILE, newLines.join('\n'));
    console.log(`✅ Rule removed from active rules file`);

    // Create audit entry
    const mockDb = new MockDbAdapter();
    const auditEntry = createAuditEntry(
      'rule',
      ruleId,
      'RULE_DISABLED',
      {
        ruleId,
        severity: rule.severity,
        description: rule.description,
        disabledAt: new Date().toISOString(),
        reason: 'Manual rollback via unapply-rule script',
      },
      {
        performedBy: process.env.USER || 'system',
        ruleId,
        sign: true,
      }
    );

    await writeAuditEntry(auditEntry, mockDb);
    console.log(`✅ Audit entry created: ${auditEntry.id}\n`);

    console.log('✅ Rule successfully disabled!\n');
    console.log(`To re-enable, move ${disabledRuleFile} back to rules file.`);
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

