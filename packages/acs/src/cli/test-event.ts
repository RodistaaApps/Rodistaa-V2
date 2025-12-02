/**
 * ACS Test Event CLI
 * 
 * Command-line tool to run sample events through the ACS evaluator
 * and print matched rules + action simulation results.
 */

import path from 'path';
import { loadRulesFromFile } from '../ruleLoader';
import { evaluateRules } from '../evaluator';
import { MockDbAdapter } from '../dbAdapter';
import { setDbAdapter } from '../actions';

const RULE_FILE = path.join(__dirname, '..', '..', '..', '..', 'acs_rules_top25.yaml');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
ACS Test Event CLI

Usage:
  node test-event.js <event-type> [options]

Event Types:
  gps-jump          - Test GPS jump anomaly (RF05)
  pod-duplicate     - Test POD duplicate hash (RF07)
  otp-brute-force   - Test OTP brute force protection (RF04)
  inspection-geo    - Test inspection geo missing (RF09)
  kyc-mandatory     - Test KYC mandatory check (RF01)

Examples:
  node test-event.js gps-jump
  node test-event.js pod-duplicate
    `);
    process.exit(0);
  }

  const eventType = args[0];

  console.log('🔍 ACS Test Event Evaluator\n');
  console.log(`Testing event type: ${eventType}\n`);

  try {
    // Load rules
    console.log(`📋 Loading rules from: ${RULE_FILE}`);
    const rules = loadRulesFromFile(RULE_FILE);
    console.log(`✅ Loaded ${rules.length} rules\n`);

    // Setup mock DB adapter
    const mockDb = new MockDbAdapter();
    setDbAdapter(mockDb);

    // Prepare test event based on type
    const { event, ctx, system } = getTestEvent(eventType);

    console.log('📤 Test Event:');
    console.log(JSON.stringify({ event, ctx, system }, null, 2));
    console.log('\n');

    // Evaluate rules
    const matches = await evaluateRules(event, ctx, system, undefined, mockDb);

    console.log(`\n${matches.length === 0 ? '✅' : '⚠️'} Results:\n`);

    if (matches.length > 0) {
      console.log(`Matched ${matches.length} rule(s):\n`);
      matches.forEach((match) => {
        console.log(`  Rule ID: ${match.ruleId}`);
        console.log(`  Description: ${match.rule?.description || 'N/A'}`);
        console.log(`  Severity: ${match.rule?.severity || 'N/A'}`);
        console.log(`  Priority: ${match.rule?.priority || 'N/A'}`);
        console.log(`  Matched: ${match.matched}`);
        console.log(`  Evaluation Result: ${JSON.stringify(match.evaluationResult)}`);
        if (match.actionResults && match.actionResults.length > 0) {
          console.log(`  Action Results:`);
          match.actionResults.forEach((ar, i) => {
            console.log(`    [${i + 1}] ${JSON.stringify(ar, null, 6)}`);
          });
        }
        if (match.auditId) {
          console.log(`  Audit ID: ${match.auditId}`);
        }
        console.log('');
      });
    } else {
      console.log('  No rules matched (this is expected for normal events)\n');
    }

    console.log('✅ Test complete!\n');
    process.exit(matches.length > 0 ? 0 : 0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function getTestEvent(eventType: string): { event: any; ctx: any; system: any } {
  switch (eventType) {
    case 'gps-jump':
      return {
        event: {
          type: 'gps.ping',
          gps: {
            deltaDistanceKm: 250,
            deltaTimeSec: 200,
          },
          shipment: {
            id: 'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
          },
        },
        ctx: {
          userId: 'USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FAV',
          deviceId: 'dev-123',
          route: 'gps.ping',
        },
        system: {
          config: {
            otpRetryLimit: 5,
            spoofThreshold: 0.8,
            maxGeoAccuracyMeters: 100,
            podTimeWindowBefore: 86400000, // 1 day
            podTimeWindowAfter: 86400000,
            maxTrucksPerOperator: 10,
            triadWindow: 30,
            triadFrequencyThreshold: 5,
          },
        },
      };

    case 'pod-duplicate':
      return {
        event: {
          type: 'pod.uploaded',
          pod: {
            fileHash: 'abc123def456duplicate',
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
          shipment: {
            id: 'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
            pickupAt: new Date(Date.now() - 86400000).toISOString(),
            dropAt: new Date().toISOString(),
          },
        },
        ctx: {
          userId: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
          uploaderId: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
        },
        system: {
          config: {
            podTimeWindowBefore: 86400000,
            podTimeWindowAfter: 86400000,
          },
          db: {
            indexes: {
              pod_hashes: ['abc123def456duplicate'], // Simulate existing hash
            },
          },
        },
      };

    case 'otp-brute-force':
      return {
        event: {
          type: 'security.otp_attempt',
          shipment: {
            id: 'SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
            otpAttempts: 6, // Exceeds limit
          },
        },
        ctx: {
          userId: 'USR-DR-01ARZ3NDEKTSV4RRFFQ69G5FAV',
        },
        system: {
          config: {
            otpRetryLimit: 5,
          },
        },
      };

    case 'inspection-geo':
      return {
        event: {
          type: 'inspection.uploaded',
          inspection: {
            id: 'INS-01ARZ3NDEKTSV4RRFFQ69G5FAV',
            truckId: 'TRK-01ARZ3NDEKTSV4RRFFQ69G5FAV',
            geo: null, // Missing geo
          },
        },
        ctx: {
          userId: 'USR-OP-01ARZ3NDEKTSV4RRFFQ69G5FAV',
        },
        system: {
          config: {
            maxGeoAccuracyMeters: 100,
          },
        },
      };

    case 'kyc-mandatory':
      return {
        event: {
          type: 'booking.create',
        },
        ctx: {
          userId: 'USR-SH-01ARZ3NDEKTSV4RRFFQ69G5FAV',
          userRole: 'shipper',
          userKycStatus: 'PENDING', // Not verified
        },
        system: {
          config: {},
        },
      };

    default:
      throw new Error(`Unknown event type: ${eventType}. Use --help for available types.`);
  }
}

if (require.main === module) {
  main();
}

