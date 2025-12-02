/**
 * Route Registration
 * Registers all module routes matching OpenAPI specification
 */

import { FastifyInstance } from 'fastify';
import { AuthController } from '../modules/auth/auth.controller';
import { BookingsController } from '../modules/bookings/bookings.controller';
import { BidsController } from '../modules/bids/bids.controller';
import { ShipmentsController } from '../modules/shipments/shipments.controller';
import { TrucksController } from '../modules/trucks/trucks.controller';
import { LedgerController } from '../modules/ledger/ledger.controller';
import * as shipmentsService from '../modules/shipments/shipments.service';
import * as bidsService from '../modules/bids/bids.service';

export async function registerRoutes(server: FastifyInstance) {
  const authController = new AuthController();
  const bookingsController = new BookingsController();
  const bidsController = new BidsController();
  const shipmentsController = new ShipmentsController();
  const trucksController = new TrucksController();
  const ledgerController = new LedgerController();

  // ==================== Auth Routes ====================
  server.post('/auth/login', async (req, reply) => {
    return authController.login(req, reply);
  });

  server.post('/auth/refresh', async (req, reply) => {
    return authController.refresh(req, reply);
  });

  server.post('/auth/logout', async (req, reply) => {
    return authController.logout(req, reply);
  });

  // ==================== Booking Routes ====================
  server.post('/bookings', async (req, reply) => {
    return bookingsController.createBooking(req, reply);
  });

  server.get('/bookings', async (req, reply) => {
    return bookingsController.getBookings(req, reply);
  });

  server.get('/bookings/:bookingId', async (req, reply) => {
    return bookingsController.getBooking(req, reply);
  });

  server.post('/bookings/:bookingId/cancel', async (req, reply) => {
    return bookingsController.cancelBooking(req, reply);
  });

  // ==================== Bid Routes ====================
  server.post('/bookings/:bookingId/bids', async (req, reply) => {
    return bidsController.createBid(req, reply);
  });

  server.get('/bookings/:bookingId/bids', async (req, reply) => {
    return bidsController.listBids(req, reply);
  });

  server.get('/bids/:bidId', async (req, reply) => {
    return bidsController.getBid(req, reply);
  });

  server.patch('/bids/:bidId', async (req, reply) => {
    return bidsController.updateBid(req, reply);
  });

  server.post('/bids/:bidId/finalize', async (req, reply) => {
    return bidsController.finalizeBid(req, reply);
  });

  // ==================== Shipment Routes ====================
  // Create shipment when booking is finalized (internal call)
  server.post('/bookings/:bookingId/shipments', async (req, reply) => {
    try {
      const { bookingId } = req.params as { bookingId: string };
      const shipment = await shipmentsService.createShipmentFromBooking(bookingId);
      return reply.code(201).send(shipment);
    } catch (error: any) {
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: error.message,
      });
    }
  });

  server.get('/shipments/:shipmentId', async (req, reply) => {
    return shipmentsController.getShipment(req, reply);
  });

  server.post('/shipments/:shipmentId/start', async (req, reply) => {
    return shipmentsController.startShipment(req, reply);
  });

  server.post('/shipments/:shipmentId/ping', async (req, reply) => {
    return shipmentsController.recordGpsPing(req, reply);
  });

  server.post('/shipments/:shipmentId/pod', async (req, reply) => {
    return shipmentsController.uploadPOD(req, reply);
  });

  server.post('/shipments/:shipmentId/complete', async (req, reply) => {
    return shipmentsController.completeShipment(req, reply);
  });

  // ==================== Auto-finalization Job ====================
  // This would typically run as a cron job, but exposed as endpoint for testing
  server.post('/internal/bookings/:bookingId/auto-finalize', async (req, reply) => {
    try {
      const { bookingId } = req.params as { bookingId: string };
      const result = await bidsService.autoFinalizeBid(bookingId);
      
      if (result.finalized && result.bid) {
        // Create shipment automatically
        await shipmentsService.createShipmentFromBooking(bookingId);
      }
      
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: error.message,
      });
    }
  });

  // ==================== Truck Routes ====================
  server.post('/trucks', async (req, reply) => {
    return trucksController.createTruck(req, reply);
  });

  server.get('/trucks', async (req, reply) => {
    return trucksController.listTrucks(req, reply);
  });

  server.get('/trucks/:truckId', async (req, reply) => {
    return trucksController.getTruck(req, reply);
  });

  server.post('/trucks/:truckId/block', async (req, reply) => {
    return trucksController.blockTruck(req, reply);
  });

  server.post('/trucks/:truckId/unblock', async (req, reply) => {
    return trucksController.unblockTruck(req, reply);
  });

  server.post('/trucks/:truckId/inspect', async (req, reply) => {
    return trucksController.createInspection(req, reply);
  });

  // ==================== Ledger Routes ====================
  server.get('/operators/:operatorId/balance', async (req, reply) => {
    return ledgerController.getBalance(req, reply);
  });

  server.get('/operators/:operatorId/ledger', async (req, reply) => {
    return ledgerController.getLedgerEntries(req, reply);
  });

  // TODO: Additional routes to implement:
  // - Users/KYC routes
  // - Drivers routes
  // - Admin routes
  // - Franchise routes
  // - ACS routes
  // - Webhook routes
}
