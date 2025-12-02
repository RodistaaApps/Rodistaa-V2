/**
 * Rodistaa Backend - Main Entry Point
 */

import dotenv from 'dotenv';
import { createServer } from './server';
import { config } from './config';

dotenv.config();

async function main() {
  try {
    const server = await createServer();

    // Start server
    const port = config.port;
    const host = '0.0.0.0';

    await server.listen({ port, host });

    console.log(`🚀 Rodistaa Backend started on http://${host}:${port}`);
    console.log(`📚 Health check: http://${host}:${port}/health`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();
