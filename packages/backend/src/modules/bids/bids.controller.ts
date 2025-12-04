/**
 * Bids Controller
 * Handles bid endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import * as bidsService from './bids.service';
import logger from 'pino';

const log = logger({ name: 'bids-controller' });

export class BidsController {
  /**
   * Create a new bid
   */
  async createBid(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      const { bookingId } = req.params as { bookingId: string };
      const payload = req.body as any;

      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      if (!payload.truckId || !payload.amount) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'Missing required fields: truckId, amount',
        });
      }

      const bid = await bidsService.createBid(
        user.id,
        {
          bookingId,
          truckId: payload.truckId,
          driverId: payload.driverId,
          amount: parseFloat(payload.amount),
          notes: payload.notes,
        },
        {
          userRole: user.role,
          kycStatus: user.kycStatus,
        }
      );

      return reply.code(201).send(bid);
    } catch (error: any) {
      log.error({ error }, 'Failed to create bid');

      if (error.message === 'Booking not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('rejected') || error.message.includes('ACS')) {
        return reply.code(403).send({
          code: 'ACS_REJECTED',
          message: error.message,
        });
      }

      if (error.message.includes('Bid amount must be')) {
        return reply.code(400).send({
          code: 'INVALID_AMOUNT',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to create bid',
      });
    }
  }

  /**
   * List bids for a booking
   */
  async listBids(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { bookingId } = req.params as { bookingId: string };

      const bids = await bidsService.listBidsByBooking(bookingId);

      return reply.code(200).send({
        data: bids,
      });
    } catch (error: any) {
      log.error({ error }, 'Failed to list bids');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve bids',
      });
    }
  }

  /**
   * Get bid by ID
   */
  async getBid(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { bidId } = req.params as { bidId: string };

      const bid = await bidsService.getBidById(bidId);

      if (!bid) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Bid not found',
        });
      }

      return reply.code(200).send(bid);
    } catch (error: any) {
      log.error({ error }, 'Failed to get bid');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve bid',
      });
    }
  }

  /**
   * Update bid
   */
  async updateBid(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      const { bidId } = req.params as { bidId: string };
      const payload = req.body as any;

      const updates: any = {};
      if (payload.amount !== undefined) {
        updates.amount = parseFloat(payload.amount);
      }
      if (payload.notes !== undefined) {
        updates.notes = payload.notes;
      }

      const bid = await bidsService.updateBid(bidId, user.id, updates);

      return reply.code(200).send(bid);
    } catch (error: any) {
      log.error({ error }, 'Failed to update bid');

      if (error.message === 'Bid not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('Unauthorized')) {
        return reply.code(403).send({
          code: 'FORBIDDEN',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to update bid',
      });
    }
  }

  /**
   * Finalize bid (admin only)
   */
  async finalizeBid(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      const { bidId } = req.params as { bidId: string };

      if (user.role !== 'ADMIN' && user.role !== 'AD') {
        return reply.code(403).send({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const bid = await bidsService.finalizeBid(bidId, user.id);

      return reply.code(200).send(bid);
    } catch (error: any) {
      log.error({ error }, 'Failed to finalize bid');

      if (error.message === 'Bid not found' || error.message === 'Booking not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to finalize bid',
      });
    }
  }
}
