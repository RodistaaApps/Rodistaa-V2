/**
 * ACS Adapter Module
 * 
 * Integrates ACS (Anti-Corruption Shield) with backend:
 * - Loads rules from YAML file
 * - Sets up database adapter for audit logging
 * - Provides evaluation helpers
 */

import path from 'path';
import { loadRulesFromFile, evaluateRules, setDbAdapter } from '@rodistaa/acs';
import { PostgresDbAdapter } from '@rodistaa/acs/src/dbAdapter';
import { query } from '../../db/connection';
import logger from 'pino';

const log = logger({ name: 'acs-adapter' });

// Path to ACS rules file
const RULES_FILE = path.join(process.cwd(), '..', '..', 'acs_rules_top25.yaml');

let acsInitialized = false;

/**
 * Initialize ACS with database adapter and load rules
 */
export async function initializeAcs(): Promise<void> {
  if (acsInitialized) {
    log.debug('ACS already initialized');
    return;
  }

  try {
    // Create database adapter for ACS
    const dbAdapter = new PostgresDbAdapter(async (text: string, params?: any[]) => {
      const result = await query(text, params);
      return result;
    });

    // Set the adapter for ACS action handlers
    setDbAdapter(dbAdapter);

    // Load ACS rules
    const rules = loadRulesFromFile(RULES_FILE);
    log.info({ count: rules.length }, 'ACS rules loaded');

    acsInitialized = true;
  } catch (error: any) {
    log.error({ error }, 'Failed to initialize ACS');
    throw error;
  }
}

/**
 * Evaluate ACS rules for an event and context
 */
export async function evaluateAcsRules(
  event: any,
  context: any,
  systemConfig: any = {}
): Promise<any[]> {
  if (!acsInitialized) {
    await initializeAcs();
  }

  // Get database adapter
  const dbAdapter = new PostgresDbAdapter(async (text: string, params?: any[]) => {
    const result = await query(text, params);
    return result;
  });

  const matches = await evaluateRules(event, context, systemConfig, undefined, dbAdapter);
  return matches;
}

/**
 * Check if request should be rejected based on ACS evaluation
 */
export function shouldRejectRequest(matches: any[]): { reject: boolean; reason?: any } {
  // Check for rejections in action results
  for (const match of matches) {
    if (match.actionResults) {
      for (const result of match.actionResults) {
        if (Array.isArray(result)) {
          for (const item of result) {
            if (item.rejected === true) {
              return {
                reject: true,
                reason: {
                  code: item.code || 'ACS_REJECTED',
                  message: item.message || 'Request rejected by ACS',
                  ruleId: match.ruleId,
                },
              };
            }
          }
        } else if (result.rejected === true) {
          return {
            reject: true,
            reason: {
              code: result.code || 'ACS_REJECTED',
              message: result.message || 'Request rejected by ACS',
              ruleId: match.ruleId,
            },
          };
        }
      }
    }
  }

  // Check for critical severity matches
  const criticalMatch = matches.find((m) => m.rule?.severity === 'critical');
  if (criticalMatch) {
    return {
      reject: true,
      reason: {
        code: 'ACS_BLOCKED',
        message: 'Request blocked by Anti-Corruption Shield',
        ruleId: criticalMatch.ruleId,
      },
    };
  }

  return { reject: false };
}

