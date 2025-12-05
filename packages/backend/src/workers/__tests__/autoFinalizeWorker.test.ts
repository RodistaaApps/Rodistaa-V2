/**
 * Auto-Finalize Worker Tests
 * 
 * Tests for the auto-finalize background job:
 * - Idempotency (safe to run multiple times)
 * - Lowest bid selection
 * - Shipment creation
 * - Event logging
 * - Error handling
 */

import { Pool } from 'pg';
import Redis from 'ioredis';
import { AutoFinalizeWorker } from '../autoFinalizeWorker';

// Mock dependencies
jest.mock('ioredis');
jest.mock('../../admin/services/auditService');
jest.mock('../../admin/services/notificationService');

describe('AutoFinalizeWorker', () => {
  let pool: jest.Mocked<Pool>;
  let redis: jest.Mocked<Redis>;
  let worker: AutoFinalizeWorker;

  beforeEach(() => {
    // Mock Pool
    pool = {
      query: jest.fn(),
      connect: jest.fn(),
    } as any;

    // Mock Redis
    redis = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    } as any;

    worker = new AutoFinalizeWorker(pool, redis, {
      intervalMs: 1000,
      lockTtlMs: 500,
      batchSize: 5,
    });
  });

  afterEach(() => {
    if (worker) {
      worker.stop();
    }
    jest.clearAllMocks();
  });

  describe('findReadyBookings', () => {
    it('should find bookings ready for auto-finalization', async () => {
      const mockBookings = [
        {
          id: 'BKG-001',
          shipper_id: 'USR-001',
          auto_finalize_at: new Date().toISOString(),
          status: 'bidding',
          bids_count: 3,
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockBookings });

      // Call private method via type casting
      const bookings = await (worker as any).findReadyBookings();

      expect(bookings).toEqual(mockBookings);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        [5]
      );
    });

    it('should return empty array when no bookings ready', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const bookings = await (worker as any).findReadyBookings();

      expect(bookings).toEqual([]);
    });
  });

  describe('findLowestBid', () => {
    it('should find the lowest valid bid', async () => {
      const mockBid = {
        id: 'BID-001',
        operator_id: 'OP-001',
        truck_id: 'TRUCK-001',
        driver_id: 'DRV-001',
        amount: 45000,
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockBid] });

      const bid = await (worker as any).findLowestBid('BKG-001');

      expect(bid).toEqual(mockBid);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY amount ASC'),
        ['BKG-001']
      );
    });

    it('should return null when no bids exist', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const bid = await (worker as any).findLowestBid('BKG-001');

      expect(bid).toBeNull();
    });
  });

  describe('processBooking with Redis locking', () => {
    it('should acquire lock and process booking', async () => {
      const mockBooking = {
        id: 'BKG-001',
        shipper_id: 'USR-001',
        auto_finalize_at: new Date().toISOString(),
        status: 'bidding',
      };

      const mockBid = {
        id: 'BID-001',
        operator_id: 'OP-001',
        truck_id: 'TRUCK-001',
        driver_id: 'DRV-001',
        amount: 45000,
      };

      // Mock Redis lock acquisition
      (redis.set as jest.Mock).mockResolvedValue('OK');
      (redis.get as jest.Mock).mockResolvedValue('mock-lock-value');

      // Mock database queries
      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockBid] });

      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ id: 'BKG-001' }] }),
        release: jest.fn(),
      };
      (pool.connect as jest.Mock).mockResolvedValue(mockClient);

      await (worker as any).processBooking(mockBooking);

      // Verify lock was acquired
      expect(redis.set).toHaveBeenCalledWith(
        'auto-finalize:BKG-001',
        expect.any(String),
        'PX',
        500,
        'NX'
      );

      // Verify lock was released
      expect(redis.del).toHaveBeenCalledWith('auto-finalize:BKG-001');
    });

    it('should skip booking if lock cannot be acquired', async () => {
      const mockBooking = {
        id: 'BKG-001',
        shipper_id: 'USR-001',
      };

      // Mock lock acquisition failure
      (redis.set as jest.Mock).mockResolvedValue(null);

      await (worker as any).processBooking(mockBooking);

      // Verify no database operations were performed
      expect(pool.query).not.toHaveBeenCalled();
      expect(pool.connect).not.toHaveBeenCalled();
    });

    it('should be idempotent - processing same booking twice should be safe', async () => {
      const mockBooking = {
        id: 'BKG-001',
        shipper_id: 'USR-001',
      };

      // First call: lock acquired
      (redis.set as jest.Mock).mockResolvedValueOnce('OK');
      (redis.get as jest.Mock).mockResolvedValue('lock-1');

      // Second call: lock already held
      (redis.set as jest.Mock).mockResolvedValueOnce(null);

      const mockBid = { id: 'BID-001', amount: 45000, operator_id: 'OP-001' };
      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockBid] });

      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      (pool.connect as jest.Mock).mockResolvedValue(mockClient);

      // First process
      await (worker as any).processBooking(mockBooking);

      // Second process (should skip)
      await (worker as any).processBooking(mockBooking);

      // Should only process once
      expect(pool.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('finalizeBooking', () => {
    it('should create shipment and update booking', async () => {
      const mockBooking = {
        id: 'BKG-001',
        shipper_id: 'USR-001',
      };

      const mockBid = {
        id: 'BID-001',
        operator_id: 'OP-001',
        truck_id: 'TRUCK-001',
        driver_id: 'DRV-001',
        amount: 45000,
      };

      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [] }) // UPDATE bookings
          .mockResolvedValueOnce({ rows: [] }) // UPDATE winning bid
          .mockResolvedValueOnce({ rows: [] }) // UPDATE other bids
          .mockResolvedValueOnce({
            rows: [{
              id: 'BKG-001',
              pickup_address: 'Test Pickup',
              pickup_city: 'City A',
              drop_address: 'Test Drop',
              drop_city: 'City B',
              distance_km: 500,
            }],
          }) // SELECT booking details
          .mockResolvedValueOnce({ rows: [] }) // INSERT shipment
          .mockResolvedValueOnce({ rows: [] }) // UPDATE booking with shipment ID
          .mockResolvedValueOnce({ rows: [] }) // INSERT events
          .mockResolvedValueOnce({ rows: [] }), // COMMIT
        release: jest.fn(),
      };

      (pool.connect as jest.Mock).mockResolvedValue(mockClient);

      await (worker as any).finalizeBooking(mockBooking, mockBid);

      // Verify transaction
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');

      // Verify booking updated
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE bookings'),
        expect.arrayContaining(['BID-001', 'BKG-001'])
      );

      // Verify shipment created
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO shipments'),
        expect.any(Array)
      );

      // Verify events created
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO booking_shipment_events'),
        expect.any(Array)
      );
    });

    it('should rollback transaction on error', async () => {
      const mockBooking = { id: 'BKG-001' };
      const mockBid = { id: 'BID-001', amount: 45000 };

      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockRejectedValueOnce(new Error('Database error')), // UPDATE fails
        release: jest.fn(),
      };

      (pool.connect as jest.Mock).mockResolvedValue(mockClient);

      await expect(
        (worker as any).finalizeBooking(mockBooking, mockBid)
      ).rejects.toThrow('Database error');

      // Verify rollback
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('handleNoValidBids', () => {
    it('should log event when no valid bids', async () => {
      const mockBooking = { id: 'BKG-001', shipper_id: 'USR-001' };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await (worker as any).handleNoValidBids(mockBooking);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO booking_shipment_events'),
        expect.arrayContaining(['BKG-001'])
      );
    });
  });

  describe('handleError', () => {
    it('should log error event', async () => {
      const mockBooking = { id: 'BKG-001' };
      const mockError = new Error('Test error');

      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await (worker as any).handleError(mockBooking, mockError);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AUTO_FINALIZE_ERROR'),
        expect.any(Array)
      );
    });
  });

  describe('Worker lifecycle', () => {
    it('should start and stop worker', () => {
      jest.useFakeTimers();

      worker.start();
      expect((worker as any).intervalId).not.toBeNull();

      worker.stop();
      expect((worker as any).intervalId).toBeNull();

      jest.useRealTimers();
    });

    it('should not start worker twice', () => {
      worker.start();
      const intervalId = (worker as any).intervalId;

      worker.start();
      expect((worker as any).intervalId).toBe(intervalId);

      worker.stop();
    });
  });
});

