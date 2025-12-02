/**
 * ACS CLI Tool
 * Command-line tool for loading and testing ACS rules
 */

import path from 'path';
import { loadRulesFromFile, watchRulesFile, getRules } from './ruleLoader';
import { evaluateRules } from './evaluator';
import * as actions from './actions';

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

    // Setup action handler
    const actionHandler = async (actionDef: any, evalCtx: any) => {
      const key = Object.keys(actionDef)[0];
      const payload = actionDef[key];

      switch (key) {
        case 'freezeShipment':
          return actions.freezeShipmentAction(payload, evalCtx);
        case 'blockEntity':
          return actions.blockEntityAction(payload, evalCtx);
        case 'createTicket':
          return actions.createTicketAction(payload, evalCtx);
        case 'emitEvent':
          return actions.emitEventAction(payload, evalCtx);
        case 'rejectRequest':
          return actions.rejectRequestAction(payload, evalCtx);
        case 'flagWatchlist':
          return actions.flagWatchlistAction(payload, evalCtx);
        case 'requireManualReview':
          return actions.requireManualReviewAction(payload, evalCtx);
        default:
          return { ok: true, info: 'unknown-action-stub', actionDef };
      }
    };

    // Test with sample GPS ping event
    console.log('\n🧪 Testing with sample GPS jump event...');
    const testEvent = {
      type: 'gps.ping',
      gps: { deltaDistanceKm: 250, deltaTimeSec: 200 },
      shipment: { id: 'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV' },
    };

    const testCtx = {
      userId: 'USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FEV',
      deviceId: 'dev-123',
      route: 'gps.ping',
    };

    const matches = await evaluateRules(testEvent, testCtx, {}, actionHandler);

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

