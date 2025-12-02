import { insertAudit } from "../models/acs";

export async function writeAudit(event: any, ruleId?: string, ruleVersion?: string, signer?: string) {
  const auditPayload = {
    source: "acs",
    event,
    rule_id: ruleId,
    rule_version: ruleVersion,
    signer: signer || "acs-service",
  };

  const id = await insertAudit({ ...auditPayload });
  return id;
}

