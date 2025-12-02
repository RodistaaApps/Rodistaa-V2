import dotenv from "dotenv";

dotenv.config();

import { createServer } from "./server";
import logger from "pino";

const log = logger({ name: process.env.SERVICE_NAME || "rodistaa-acs" });

const port = Number(process.env.PORT || 4000);

async function main() {
  const app = await createServer();
  app.listen(port, () => {
    log.info(`Rodistaa ACS service running on port ${port}`);
  });
}

main().catch((err) => {
  log.error(err, "Failed to start ACS service");
  process.exit(1);
});

