/**
 * ACS CLI Tool
 * Command-line tool for loading and testing ACS rules
 */

import path from 'path';
import { loadRulesFromFile, watchRulesFile, getRules } from './ruleLoader';
import { evaluateRules, defaultActionHandler } from './evaluator';
import { setDbAdapter } from './actions';
import { MockDbAdapter } from './dbAdapter';

const RULE_FILE = path.join(__dirname, '..', '..', '..', 'acs_rules_top25.yaml');

async function main() {
  console.log('🔍 ACS Rule Loader & Evaluator CLI\n');

  try {
    // Load rules
    console.log('📋 Loading rules from:', RULE_FILE);
    const rules = loadRulesFromFile(RULE_FILE);
    console.log(`✅ Loaded ${rules.length} rules\n`);

    // Show sample rule IDs
    console.log('📝 Sample rule IDs:');
    rules.slice(0, 5).forEach((r) => {
      console.log(`   - ${r.id} (priority: ${r.priority}, severity: ${r.severity})`);
    });

    // Setup mock DB adapter for CLI testing
    const mockDb = new MockDbAdapter();
    setDbAdapter(mockDb);

    // Test with sample GPS ping event
    console.log('\n🧪 Testing with sample GPS jump event...');
    const testEvent = {
      type: 'gps.ping',
      gps: { deltaDistanceKm: 250, deltaTimeSec: 200 },
      shipment: { id: 'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
    };

    const testCtx = {
      userId: 'USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FAV',
      deviceId: 'dev-123',
      route: 'gps.ping',
    };

    const matches = await evaluateRules(testEvent, testCtx, {}, defaultActionHandler, mockDb);

    if (matches.length > 0) {
      console.log(`\n⚠️  ${matches.length} rule(s) matched:`);
      matches.forEach((m) => {
        console.log(`   - ${m.ruleId}: ${m.rule.description}`);
      });
    } else {
      console.log('\n✅ No rules matched (this is expected for normal events)');
    }

    console.log('\n✅ ACS CLI test complete!');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

