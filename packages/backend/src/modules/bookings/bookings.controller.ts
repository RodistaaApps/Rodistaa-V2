/**
 * Bookings Controller
 * Handles booking lifecycle endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import * as bookingsService from './bookings.service';
import logger from 'pino';

const log = logger({ name: 'bookings-controller' });

export class BookingsController {
  /**
   * Create a new booking
   */
  async createBooking(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const payload = req.body as any;

      // Validate required fields
      if (!payload.pickup || !payload.drop || !payload.goods || !payload.tonnage) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'Missing required fields: pickup, drop, goods, tonnage',
        });
      }

      if (!payload.priceRange || !payload.priceRange.min || !payload.priceRange.max) {
        return reply.code(400).send({
          code: 'MISSING_FIELDS',
          message: 'Missing required field: priceRange (min, max)',
        });
      }

      const booking = await bookingsService.createBooking(
        user.id,
        {
          pickup: payload.pickup,
          drop: payload.drop,
          goods: payload.goods,
          tonnage: parseFloat(payload.tonnage),
          priceRangeMin: parseFloat(payload.priceRange.min),
          priceRangeMax: parseFloat(payload.priceRange.max),
        },
        {
          userRole: user.role,
          kycStatus: user.kycStatus,
        }
      );

      return reply.code(201).send(booking);
    } catch (error: any) {
      log.error({ error }, 'Failed to create booking');
      
      if (error.message && error.message.includes('rejected')) {
        return reply.code(403).send({
          code: 'ACS_REJECTED',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to create booking',
      });
    }
  }

  /**
   * List bookings with filters
   */
  async getBookings(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const query = req.query as any;

      const filters: any = {
        page: parseInt(query.page || '1', 10),
        limit: parseInt(query.limit || '20', 10),
      };

      // Apply user-specific filters
      if (user.role === 'SHIPPER' || user.role === 'SH') {
        filters.shipperId = user.id;
      }

      if (query.status) {
        filters.status = query.status;
      }

      const result = await bookingsService.listBookings(filters);

      return reply.code(200).send({
        data: result.data,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          nextPageCursor: result.page < result.totalPages ? `${result.page + 1}` : null,
        },
      });
    } catch (error: any) {
      log.error({ error }, 'Failed to list bookings');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve bookings',
      });
    }
  }

  /**
   * Get booking by ID
   */
  async getBooking(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { bookingId } = req.params as { bookingId: string };
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const booking = await bookingsService.getBookingById(bookingId);

      if (!booking) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        });
      }

      // Verify access
      if ((user.role === 'SHIPPER' || user.role === 'SH') && booking.shipperId !== user.id) {
        return reply.code(403).send({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      return reply.code(200).send(booking);
    } catch (error: any) {
      log.error({ error }, 'Failed to get booking');
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve booking',
      });
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { bookingId } = req.params as { bookingId: string };
      const user = req.user;
      if (!user) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const { reason } = req.body as { reason?: string };

      const booking = await bookingsService.cancelBooking(
        bookingId,
        reason || 'Cancelled by user',
        user.id
      );

      return reply.code(200).send(booking);
    } catch (error: any) {
      log.error({ error }, 'Failed to cancel booking');
      
      if (error.message === 'Booking not found') {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error.message.includes('Unauthorized') || error.message.includes('Cannot cancel')) {
        return reply.code(403).send({
          code: 'FORBIDDEN',
          message: error.message,
        });
      }

      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Failed to cancel booking',
      });
    }
  }
}

