import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Bid, BidStatus } from '../../entities/bid.entity';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { Truck } from '../../entities/truck.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { PlaceBidDto, UpdateBidDto } from './dto/place-bid.dto';
import { BookingsService } from '../bookings/bookings.service';
import { RedisService } from '../../common/redis.service';
import { KafkaService } from '../../common/kafka.service';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Truck)
    private truckRepository: Repository<Truck>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private bookingsService: BookingsService,
    private redisService: RedisService,
    private kafkaService: KafkaService,
  ) {}

  async placeBid(operatorId: string, dto: PlaceBidDto): Promise<Bid> {
    const booking = await this.bookingRepository.findOne({
      where: { id: dto.bookingId },
      relations: ['bids'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.status !== BookingStatus.POSTED) {
      throw new BadRequestException('Booking is not open for bidding');
    }

    // BUSINESS RULE: Only ONE active bid per operator per booking
    // If operator already has a PENDING bid, they must modify it, not create new
    const existingBid = await this.bidRepository.findOne({
      where: {
        bookingId: dto.bookingId,
        operatorId: operatorId,
        status: BidStatus.PENDING,
      },
    });

    if (existingBid) {
      throw new BadRequestException(
        `You already have an active bid (${existingBid.id}) on this booking. Please modify your existing bid instead of creating a new one. Business Rule: Only one active bid per operator per booking.`
      );
    }

    // FTL/PTL constraint: Check if truck already has FTL
    if (booking.loadType === 'FTL' && dto.truckId) {
      const existingFTL = await this.bidRepository.findOne({
        where: {
          truckId: dto.truckId,
          status: BidStatus.ACCEPTED,
        },
        relations: ['booking'],
      });
      if (existingFTL && existingFTL.booking.loadType === 'FTL') {
        throw new BadRequestException(
          'Truck already has an active FTL shipment',
        );
      }
    }

    // Verify truck if provided
    if (dto.truckId) {
      const truck = await this.truckRepository.findOne({
        where: { id: dto.truckId },
      });
      if (!truck) {
        throw new NotFoundException('Truck not found');
      }
      if (!truck.isVerified) {
        throw new BadRequestException('Truck must be verified (SurePass)');
      }
      if (truck.status !== 'available') {
        throw new BadRequestException('Truck is not available');
      }
    }

    const bidId = `BID${Date.now().toString().slice(-6)}`;
    const bid = this.bidRepository.create({
      ...dto,
      operatorId,
      bidId,
      status: BidStatus.PENDING,
    });

    const saved = await this.bidRepository.save(bid);

    // Invalidate booking cache
    await this.redisService.del(`booking:${booking.id}`);

    // Publish to Kafka for real-time updates
    await this.kafkaService.publish('bids', {
      id: saved.id,
      entityId: saved.id,
      action: 'created',
      bid: saved,
      bookingId: booking.id,
      timestamp: new Date().toISOString(),
    });

    // Update booking bid count
    await this.bookingsService.updateBidCount(booking.id);

    // Audit log
    await this.auditLogRepository.save({
      entityType: 'bid',
      entityId: saved.id,
      action: 'create',
      userId: operatorId,
      changes: { created: saved },
    });

    return saved;
  }

  async updateBid(
    bidId: string,
    operatorId: string,
    dto: UpdateBidDto,
  ): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id: bidId, operatorId },
    });
    if (!bid) {
      throw new NotFoundException('Bid not found');
    }
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException('Only pending bids can be updated');
    }

    Object.assign(bid, dto);
    const saved = await this.bidRepository.save(bid);

    // Audit log
    await this.auditLogRepository.save({
      entityType: 'bid',
      entityId: bidId,
      action: 'update',
      userId: operatorId,
      changes: { updated: dto },
    });

    return saved;
  }

  async withdrawBid(bidId: string, operatorId: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id: bidId, operatorId },
    });
    if (!bid) {
      throw new NotFoundException('Bid not found');
    }
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException('Only pending bids can be withdrawn');
    }

    bid.status = BidStatus.WITHDRAWN;
    const saved = await this.bidRepository.save(bid);

    // Update booking bid count
    const booking = await this.bookingRepository.findOne({
      where: { id: bid.bookingId },
    });
    if (booking) {
      await this.bookingsService.updateBidCount(booking.id);
    }

    // Audit log
    await this.auditLogRepository.save({
      entityType: 'bid',
      entityId: bidId,
      action: 'withdraw',
      userId: operatorId,
      changes: { withdrawn: saved },
    });

    return saved;
  }

  async acceptBid(bidId: string, shipperId: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id: bidId },
      relations: ['booking'],
    });
    if (!bid) {
      throw new NotFoundException('Bid not found');
    }
    if (bid.booking.shipperId !== shipperId) {
      throw new BadRequestException('Only shipper can accept bids');
    }
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException('Bid is not pending');
    }

    // Reject all other bids for this booking
    await this.bidRepository.update(
      {
        bookingId: bid.bookingId,
        id: In([bidId]),
      },
      { status: BidStatus.REJECTED },
    );

    bid.status = BidStatus.ACCEPTED;
    const saved = await this.bidRepository.save(bid);

    // Update booking status
    bid.booking.status = BookingStatus.CONFIRMED;
    bid.booking.acceptedBidId = bidId;
    bid.booking.acceptedAt = new Date();
    await this.bookingRepository.save(bid.booking);

    // Invalidate cache
    await this.redisService.del(`booking:${bid.booking.id}`);

    // Publish to Kafka - bid accepted, booking confirmed
    await this.kafkaService.publish('bids', {
      id: bidId,
      entityId: bidId,
      action: 'accepted',
      bid: saved,
      bookingId: bid.booking.id,
      timestamp: new Date().toISOString(),
    });

    await this.kafkaService.publish('bookings', {
      id: bid.booking.id,
      entityId: bid.booking.id,
      action: 'confirmed',
      booking: bid.booking,
      timestamp: new Date().toISOString(),
    });

    // Audit log
    await this.auditLogRepository.save({
      entityType: 'bid',
      entityId: bidId,
      action: 'accept',
      userId: shipperId,
      changes: { accepted: saved },
    });

    return saved;
  }

  async findByBooking(bookingId: string): Promise<Bid[]> {
    return this.bidRepository.find({
      where: { bookingId },
      relations: ['operator', 'booking'],
      order: { amount: 'ASC', createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id },
      relations: ['operator', 'booking'],
    });
    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }
    return bid;
  }
}

