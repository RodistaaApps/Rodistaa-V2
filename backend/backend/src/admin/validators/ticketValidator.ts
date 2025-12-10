/**
 * Ticket Validators
 * 
 * Input validation schemas using Joi for ticket endpoints
 */

import Joi from 'joi';

/**
 * Create ticket request
 */
export const createTicketSchema = Joi.object({
  ticketType: Joi.string().valid(
    'PROVIDER_MISMATCH',
    'DUPLICATE_CHASSIS',
    'MANUAL_REVIEW',
    'DISPUTE',
    'COMPLIANCE_ISSUE',
    'DATA_QUALITY'
  ).required(),
  priority: Joi.string().valid('P0', 'P1', 'P2', 'P3').required(),
  title: Joi.string().min(10).max(255).required(),
  description: Joi.string().max(2000).optional(),
  resourceType: Joi.string().valid('truck', 'trailer', 'operator', 'shipment').required(),
  resourceId: Joi.string().required(),
  metadata: Joi.object().optional().default({}),
  tags: Joi.array().items(Joi.string()).optional().default([]),
});

/**
 * Assign ticket request
 */
export const assignTicketSchema = Joi.object({
  assignedTo: Joi.string().required()
    .messages({
      'any.required': 'assignedTo admin ID is required',
    }),
});

/**
 * Resolve ticket request
 */
export const resolveTicketSchema = Joi.object({
  resolution: Joi.string().min(20).max(2000).required()
    .messages({
      'string.min': 'Resolution must be at least 20 characters',
      'any.required': 'Resolution notes are required',
    }),
  resolutionType: Joi.string().valid(
    'APPROVED',
    'REJECTED',
    'FIXED',
    'NO_ACTION_NEEDED',
    'ESCALATED_TO_EXTERNAL'
  ).required(),
});

/**
 * Escalate ticket request
 */
export const escalateTicketSchema = Joi.object({
  reason: Joi.string().min(20).max(500).required()
    .messages({
      'string.min': 'Escalation reason must be at least 20 characters',
      'any.required': 'Reason is required for escalation',
    }),
});

/**
 * Add comment request
 */
export const addCommentSchema = Joi.object({
  comment: Joi.string().min(1).max(2000).required()
    .messages({
      'any.required': 'Comment text is required',
    }),
  isInternal: Joi.boolean().optional().default(true),
  attachments: Joi.array().items(Joi.string()).optional().default([]),
});

/**
 * List tickets query params
 */
export const listTicketsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(25),
  status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'CLOSED').optional(),
  priority: Joi.string().valid('P0', 'P1', 'P2', 'P3').optional(),
  assignedTo: Joi.string().optional(),
  ticketType: Joi.string().optional(),
  resourceType: Joi.string().optional(),
  resourceId: Joi.string().optional(),
  slaBreached: Joi.boolean().optional(),
  sort: Joi.string().valid('created_at', 'sla_due_at', 'priority', 'status').optional(),
  order: Joi.string().valid('asc', 'desc').optional(),
});

export default {
  createTicketSchema,
  assignTicketSchema,
  resolveTicketSchema,
  escalateTicketSchema,
  addCommentSchema,
  listTicketsSchema,
};

