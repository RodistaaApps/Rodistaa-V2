/**
 * Mock Services Server
 * Provides mock implementations of external services for local development
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';

import razorpayRouter from './razorpay/razorpay.mock';
import mapsRouter from './maps/maps.mock';
import vahanRouter from './vahan/vahan.mock';
import irpRouter from './irp/irp.mock';
import sipRouter from './sip/sip.mock';

dotenv.config();

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'rodistaa-mocks' });
});

// Mount mock services
app.use('/razorpay', razorpayRouter);
app.use('/maps', mapsRouter);
app.use('/vahan', vahanRouter);
app.use('/irp', irpRouter);
app.use('/sip', sipRouter);

app.listen(PORT, () => {
  logger.info(`🚀 Mock services server running on http://localhost:${PORT}`);
  logger.info(`📦 Available services:`);
  logger.info(`   - Razorpay: http://localhost:${PORT}/razorpay`);
  logger.info(`   - Google Maps: http://localhost:${PORT}/maps`);
  logger.info(`   - Vahan: http://localhost:${PORT}/vahan`);
  logger.info(`   - IRP: http://localhost:${PORT}/irp`);
  logger.info(`   - SIP/Calling: http://localhost:${PORT}/sip`);
});

