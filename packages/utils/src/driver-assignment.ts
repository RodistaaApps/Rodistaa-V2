/**
 * Driver Assignment Approval Workflow Service
 * Handles the workflow for operator assigning drivers to shipments
 * and shipper approval/rejection process
 */

import { PrismaClient, Prisma } from '@prisma/client';

export interface AssignDriverParams {
  shipmentId: string;
  driverId: string;
  operatorId: string;
}

export interface ApproveAssignmentParams {
  assignmentId: string;
  shipperId: string;
}

export interface RejectAssignmentParams {
  assignmentId: string;
  shipperId: string;
  rejectionReason: string;
}

export interface ChangeDriverParams {
  assignmentId: string;
  operatorId: string;
  newDriverId: string;
  reason?: string;
}

export class DriverAssignmentService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Operator assigns a driver to a shipment
   * Creates a PENDING_SHIPPER_APPROVAL assignment
   */
  async assignDriver(params: AssignDriverParams): Promise<{
    assignmentId: string;
    status: string;
    shipmentId: string;
    driverId: string;
  }> {
    const { shipmentId, driverId, operatorId } = params;

    // Verify shipment exists and belongs to operator
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { booking: true },
    });

    if (!shipment) {
      throw new Error(`Shipment ${shipmentId} not found`);
    }

    // Verify operator owns the shipment
    if (shipment.operatorId !== operatorId) {
      throw new Error(`Shipment does not belong to operator ${operatorId}`);
    }

    // Verify driver exists and belongs to operator
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new Error(`Driver ${driverId} not found`);
    }

    if (driver.operatorId !== operatorId) {
      throw new Error(`Driver does not belong to operator ${operatorId}`);
    }

    // Verify driver is available
    if (driver.status !== 'AVAILABLE' && driver.status !== 'ASSIGNED') {
      throw new Error(`Driver ${driverId} is not available (status: ${driver.status})`);
    }

    // BUSINESS RULE: One active shipment per driver
    // Driver must complete current shipment before accepting new assignment
    const activeShipment = await this.prisma.shipment.findFirst({
      where: {
        driverId,
        status: {
          in: ['ASSIGNED', 'IN_TRANSIT', 'PICKUP_COMPLETED', 'DELIVERY_COMPLETED'],
        },
      },
    });

    if (activeShipment) {
      throw new Error(
        `Driver ${driverId} already has an active shipment (${activeShipment.shipmentId}). Business Rule: Driver can have only ONE active shipment at a time. Must complete current shipment before accepting new assignment.`
      );
    }

    // Check if there's already an assignment for this shipment
    const existingAssignment = await this.prisma.driverAssignment.findFirst({
      where: {
        shipmentId,
        status: {
          in: ['PENDING_SHIPPER_APPROVAL', 'APPROVED'],
        },
      },
    });

    if (existingAssignment) {
      throw new Error(
        `Shipment already has an active assignment (status: ${existingAssignment.status})`,
      );
    }

    // Create the assignment
    const assignment = await this.prisma.driverAssignment.create({
      data: {
        shipmentId,
        driverId,
        operatorId,
        status: 'PENDING_SHIPPER_APPROVAL',
      },
    });

    // Update driver status to ASSIGNED
    await this.prisma.driver.update({
      where: { id: driverId },
      data: { status: 'ASSIGNED' },
    });

    return {
      assignmentId: assignment.id,
      status: assignment.status,
      shipmentId: assignment.shipmentId,
      driverId: assignment.driverId,
    };
  }

  /**
   * Shipper approves the driver assignment
   */
  async approveAssignment(params: ApproveAssignmentParams): Promise<{
    assignmentId: string;
    status: string;
    approvedAt: Date;
  }> {
    const { assignmentId, shipperId } = params;

    const assignment = await this.prisma.driverAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        shipment: {
          include: { booking: true },
        },
      },
    });

    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    // Verify shipper owns the shipment
    if (assignment.shipment.booking.shipperId !== shipperId) {
      throw new Error(`Shipment does not belong to shipper ${shipperId}`);
    }

    if (assignment.status !== 'PENDING_SHIPPER_APPROVAL') {
      throw new Error(`Assignment is not pending approval (status: ${assignment.status})`);
    }

    // Update assignment status
    const approvedAt = new Date();
    const updatedAssignment = await this.prisma.driverAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'APPROVED',
        approvedByShipperAt: approvedAt,
      },
    });

    // Update driver status to ON_TRIP
    await this.prisma.driver.update({
      where: { id: assignment.driverId },
      data: { status: 'ON_TRIP' },
    });

    // Update shipment to link the driver
    await this.prisma.shipment.update({
      where: { id: assignment.shipmentId },
      data: { driverId: assignment.driverId },
    });

    return {
      assignmentId: updatedAssignment.id,
      status: updatedAssignment.status,
      approvedAt,
    };
  }

  /**
   * Shipper rejects the driver assignment
   */
  async rejectAssignment(params: RejectAssignmentParams): Promise<{
    assignmentId: string;
    status: string;
    rejectedAt: Date;
  }> {
    const { assignmentId, shipperId, rejectionReason } = params;

    const assignment = await this.prisma.driverAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        shipment: {
          include: { booking: true },
        },
      },
    });

    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    // Verify shipper owns the shipment
    if (assignment.shipment.booking.shipperId !== shipperId) {
      throw new Error(`Shipment does not belong to shipper ${shipperId}`);
    }

    if (assignment.status !== 'PENDING_SHIPPER_APPROVAL') {
      throw new Error(`Assignment is not pending approval (status: ${assignment.status})`);
    }

    // Update assignment status
    const rejectedAt = new Date();
    const updatedAssignment = await this.prisma.driverAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'REJECTED',
        rejectedByShipperAt: rejectedAt,
        rejectionReason,
      },
    });

    // Release driver back to AVAILABLE
    await this.prisma.driver.update({
      where: { id: assignment.driverId },
      data: { status: 'AVAILABLE' },
    });

    return {
      assignmentId: updatedAssignment.id,
      status: updatedAssignment.status,
      rejectedAt,
    };
  }

  /**
   * Operator changes the driver (before shipper approval)
   */
  async changeDriver(params: ChangeDriverParams): Promise<{
    assignmentId: string;
    status: string;
    oldDriverId: string;
    newDriverId: string;
  }> {
    const { assignmentId, operatorId, newDriverId, reason } = params;

    const assignment = await this.prisma.driverAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    if (assignment.operatorId !== operatorId) {
      throw new Error(`Assignment does not belong to operator ${operatorId}`);
    }

    if (assignment.status !== 'PENDING_SHIPPER_APPROVAL') {
      throw new Error(`Cannot change driver - assignment status is ${assignment.status}`);
    }

    // Verify new driver exists and belongs to operator
    const newDriver = await this.prisma.driver.findUnique({
      where: { id: newDriverId },
    });

    if (!newDriver) {
      throw new Error(`Driver ${newDriverId} not found`);
    }

    if (newDriver.operatorId !== operatorId) {
      throw new Error(`Driver does not belong to operator ${operatorId}`);
    }

    if (newDriver.status !== 'AVAILABLE' && newDriver.status !== 'ASSIGNED') {
      throw new Error(`Driver ${newDriverId} is not available (status: ${newDriver.status})`);
    }

    const oldDriverId = assignment.driverId;

    // Update assignment with new driver
    const updatedAssignment = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Release old driver
        await tx.driver.update({
          where: { id: oldDriverId },
          data: { status: 'AVAILABLE' },
        });

        // Mark old assignment as CHANGED (for audit trail)
        await tx.driverAssignment.update({
          where: { id: assignmentId },
          data: {
            status: 'CHANGED',
            rejectionReason: reason || 'Driver changed by operator',
          },
        });

        // Create new assignment
        const newAssignment = await tx.driverAssignment.create({
          data: {
            shipmentId: assignment.shipmentId,
            driverId: newDriverId,
            operatorId,
            status: 'PENDING_SHIPPER_APPROVAL',
          },
        });

        // Update new driver status
        await tx.driver.update({
          where: { id: newDriverId },
          data: { status: 'ASSIGNED' },
        });

        return newAssignment;
      },
    );

    return {
      assignmentId: updatedAssignment.id,
      status: updatedAssignment.status,
      oldDriverId,
      newDriverId,
    };
  }

  /**
   * Get assignment details
   */
  async getAssignment(assignmentId: string) {
    return this.prisma.driverAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        driver: true,
        shipment: {
          include: {
            booking: true,
          },
        },
      },
    });
  }

  /**
   * Get all assignments for a shipment
   */
  async getShipmentAssignments(shipmentId: string) {
    return this.prisma.driverAssignment.findMany({
      where: { shipmentId },
      include: {
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get pending assignments for a shipper
   */
  async getPendingAssignmentsForShipper(shipperId: string) {
    return this.prisma.driverAssignment.findMany({
      where: {
        status: 'PENDING_SHIPPER_APPROVAL',
        shipment: {
          booking: {
            shipperId,
          },
        },
      },
      include: {
        driver: true,
        shipment: {
          include: {
            booking: true,
          },
        },
      },
      orderBy: { requestedAt: 'asc' },
    });
  }
}

