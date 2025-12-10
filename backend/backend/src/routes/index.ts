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
import { UsersController } from '../modules/users/users.controller';
import { KycController } from '../modules/kyc/kyc.controller';
import { DriversController } from '../modules/drivers/drivers.controller';
import { AdminController } from '../modules/admin/admin.controller';
import { FranchiseController } from '../modules/franchise/franchise.controller';
import { AcsController } from '../modules/acs/acs.controller';
import { WebhooksController } from '../modules/webhooks/webhooks.controller';
import * as shipmentsService from '../modules/shipments/shipments.service';
import * as bidsService from '../modules/bids/bids.service';

export async function registerRoutes(server: FastifyInstance) {
  const authController = new AuthController();
  const bookingsController = new BookingsController();
  const bidsController = new BidsController();
  const shipmentsController = new ShipmentsController();
  const trucksController = new TrucksController();
  const ledgerController = new LedgerController();
  const usersController = new UsersController();
  const kycController = new KycController();
  const driversController = new DriversController();
  const adminController = new AdminController();
  const franchiseController = new FranchiseController();
  const acsController = new AcsController();
  const webhooksController = new WebhooksController();

  // ==================== Auth Routes ====================
  server.post('/auth/otp', async (req, reply) => {
    return authController.requestOTP(req, reply);
  });

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

  // ==================== Users Routes ====================
  server.get('/users/me', async (req, reply) => {
    return usersController.getCurrentUser(req, reply);
  });

  server.post('/users/register', async (req, reply) => {
    return usersController.register(req, reply);
  });

  server.get('/users/:userId', async (req, reply) => {
    return usersController.getUser(req, reply);
  });

  // ==================== KYC Routes ====================
  server.post('/kyc/upload', async (req, reply) => {
    return kycController.upload(req, reply);
  });

  server.get('/kyc/status', async (req, reply) => {
    return kycController.getStatus(req, reply);
  });

  server.get('/kyc/:kycId', async (req, reply) => {
    return kycController.getKyc(req, reply);
  });

  // ==================== Drivers Routes ====================
  server.post('/drivers', async (req, reply) => {
    return driversController.register(req, reply);
  });

  server.post('/drivers/:driverId/link-truck', async (req, reply) => {
    return driversController.linkTruck(req, reply);
  });

  server.get('/drivers/:driverId/profile', async (req, reply) => {
    return driversController.getProfile(req, reply);
  });

  // ==================== Admin Routes ====================
  server.get('/admin/dashboard', async (req, reply) => {
    return adminController.getDashboard(req, reply);
  });

  server.get('/admin/overrides', async (req, reply) => {
    return adminController.getOverrides(req, reply);
  });

  server.post('/admin/overrides/:overrideId/approve', async (req, reply) => {
    return adminController.approveOverride(req, reply);
  });

  server.post('/admin/overrides/:overrideId/reject', async (req, reply) => {
    return adminController.rejectOverride(req, reply);
  });

  server.get('/admin/audit', async (req, reply) => {
    return adminController.getAudit(req, reply);
  });

  server.post('/admin/kyc/:kycId/decrypt', async (req, reply) => {
    return adminController.decryptKyc(req, reply);
  });

  // ==================== Franchise Routes ====================
  server.get('/franchise/dashboard', async (req, reply) => {
    return franchiseController.getDashboard(req, reply);
  });

  server.get('/franchise/targets', async (req, reply) => {
    return franchiseController.getTargets(req, reply);
  });

  server.post('/franchise/targets', async (req, reply) => {
    return franchiseController.setTargets(req, reply);
  });

  server.get('/franchise/reports', async (req, reply) => {
    return franchiseController.getReports(req, reply);
  });

  // ==================== ACS Routes ====================
  server.post('/acs/evaluate', async (req, reply) => {
    return acsController.evaluate(req, reply);
  });

  server.get('/acs/audit/:entityType/:entityId', async (req, reply) => {
    return acsController.getAudit(req, reply);
  });

  server.get('/acs/blocks/:entityType/:entityId', async (req, reply) => {
    return acsController.getBlocks(req, reply);
  });

  // ==================== Webhook Routes ====================
  // BUSINESS RULE: Cash-only payments - Razorpay webhook removed
  // server.post('/webhooks/razorpay', async (req, reply) => {
  //   return webhooksController.razorpay(req, reply);
  // }); // REMOVED: Violates cash-only business rule
}
