import path from "path";
import { loadRulesFromFile, watchRulesFile } from "./ruleLoader";
import { evaluateRules } from "./evaluator";
import * as actions from "./actions";

const RULE_FILE = path.join(__dirname, "..", "..", "..", "acs_rules_top25.yaml");

// load once
loadRulesFromFile(RULE_FILE);

// optional: watch and reload rules when file changes
watchRulesFile(RULE_FILE, (r) => {
  console.log("rules reloaded, count:", r.length);
});

// Example event handling
export async function onEvent(event: any, ctx: any) {
  // provide a custom actionHandler that maps YAML action names to real implementations
  const actionHandler = async (actionDef: any, evalCtx: any) => {
    const key = Object.keys(actionDef)[0];
    const payload = actionDef[key];

    switch (key) {
      case "freezeShipment":
        return actions.freezeShipmentAction(payload, evalCtx);

      case "blockEntity":
        return actions.blockEntityAction(payload, evalCtx);

      case "createTicket":
        return actions.createTicketAction(payload, evalCtx);

      case "emitEvent":
        return actions.emitEventAction(payload, evalCtx);

      default:
        // fallback to default handler: resolve templates then log
        return [{ ok: true, info: "unknown-action-stub", actionDef }];
    }
  };

  const matches = await evaluateRules(event, ctx, {}, actionHandler);

  // matches contains matched rules and action results
  return matches;
}

// Example usage:
(async () => {
  const event = { type: "gps.ping", gps: { deltaDistanceKm: 250, deltaTimeSec: 200 }, shipment: { id: "S-1" } };
  const ctx = { userId: "u-1", deviceId: "dev-1", route: "gps.ping" };
  const result = await onEvent(event, ctx);
  console.log("Result matches:", result.map(m => m.ruleId));
})();

