import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import { acsPreCheck } from "./middleware/acsMiddleware";
import sampleRoutes from "./routes/sampleRoutes";
import logger from "pino";

const log = logger();

export async function createServer() {
  const app = express();

  app.use(morgan("combined"));
  app.use(bodyParser.json({ limit: "5mb" }));

  // Health check endpoint
  app.get("/health", (req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

  // Sample protected routes
  // Attach acsPreCheck middleware where applicable (can be per-route)
  app.post("/booking/create", acsPreCheck("booking.create"), sampleRoutes.createBooking);
  app.post("/pod/upload", acsPreCheck("pod.uploaded"), sampleRoutes.uploadPod);

  // Admin endpoints
  app.get("/acs/blocks/:entityType/:entityId", async (req, res) => {
    const { entityType, entityId } = req.params;
    const { getBlocksByEntity } = await import("./models/acs");
    const blocks = await getBlocksByEntity(entityType, entityId);
    res.json({ blocks });
  });

  return app;
}

