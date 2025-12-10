/**
 * Rodistaa Backend - Main Entry Point
 */

import dotenv from 'dotenv';
import { createServer } from './server';
import { config } from './config';
import { SchedulerService } from './services/scheduler.service';

dotenv.config();

async function main() {
  try {
    const server = await createServer();

    // Start scheduler service for periodic tasks
    // BUSINESS RULE: GPS alerts every minute, auto-finalization every hour, etc.
    const scheduler = new SchedulerService();
    scheduler.start();

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      scheduler.stop();
      await server.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      scheduler.stop();
      await server.close();
      process.exit(0);
    });

    // Start server
    const port = config.port;
    const host = '0.0.0.0';

    await server.listen({ port, host });

    console.log(`🚀 Rodistaa Backend started on http://${host}:${port}`);
    console.log(`📚 Health check: http://${host}:${port}/health`);
    console.log(`⏰ Scheduler service started (GPS alerts, auto-finalization, document expiry)`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();
