import { Request, Response, NextFunction } from "express";
import * as ACS from "../services/acsService";
import logger from "pino";

const log = logger();

export function acsPreCheck(routeName: string) {
  // returns middleware bound to route name
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      // build context
      const ctx: any = {
        userId: req.headers["x-user-id"] as string,
        deviceId: req.headers["x-device-id"] as string,
        ip: req.ip,
        route: routeName,
        payload: req.body,
        headers: req.headers,
        event: {
          type: routeName,
        },
      };

      // In production, enrich ctx.user from auth service / cache
      // example placeholder: attach user object if available
      if (req.headers["x-user-kyc-status"]) {
        ctx.user = { kyc_status: req.headers["x-user-kyc-status"] };
      }

      // quick reject & enforcement
      const decision = await ACS.enforce(ctx);
      // attach acs context for handler-level use
      (req as any).acs = decision.context || {};

      if (!decision.allow) {
        log.warn({ route: routeName, reason: decision.code }, "ACS blocked request");
        return res.status(decision.status).json({ code: decision.code, message: decision.message });
      }

      // pass-through
      res.setHeader("X-ACS-Audit", decision.context?.auditId || "");
      next();
    } catch (err) {
      log.error(err, "ACS middleware error");
      // fail-safe: reject sensitive operations or allow based on policy.
      return res.status(500).json({ code: "ACS_ERROR", message: "ACS processing failed" });
    }
  };
}

