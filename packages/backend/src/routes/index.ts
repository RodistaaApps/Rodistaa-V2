/**
 * Route Registration
 * Registers all module routes
 */

import { FastifyInstance } from 'fastify';
import { AuthController } from '../modules/auth/auth.controller';
import { BookingsController } from '../modules/bookings/bookings.controller';

export async function registerRoutes(server: FastifyInstance) {
  const authController = new AuthController();
  const bookingsController = new BookingsController();

  // Auth routes
  server.post('/auth/login', async (req, reply) => {
    return authController.login(req, reply);
  });

  server.post('/auth/refresh', async (req, reply) => {
    return authController.refresh(req, reply);
  });

  // Booking routes
  server.post('/bookings', async (req, reply) => {
    return bookingsController.createBooking(req, reply);
  });

  server.get('/bookings', async (req, reply) => {
    return bookingsController.getBookings(req, reply);
  });

  server.get('/bookings/:bookingId', async (req, reply) => {
    return bookingsController.getBooking(req, reply);
  });

  // TODO: Register routes from other modules
  // - Bids
  // - Shipments
  // - Trucks
  // - Users
  // - KYC
  // - etc.
}
