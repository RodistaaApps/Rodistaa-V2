/**
 * Truck Admin Validators
 * 
 * Input validation schemas using Joi for truck admin endpoints
 */

import Joi from 'joi';

/**
 * Block truck request
 */
export const blockTruckSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required()
    .messages({
      'string.min': 'Reason must be at least 10 characters',
      'string.max': 'Reason must not exceed 500 characters',
      'any.required': 'Reason is required for blocking a truck',
    }),
  evidenceIds: Joi.array().items(Joi.string()).optional(),
  createTicket: Joi.boolean().optional().default(false),
});

/**
 * Unblock truck request
 */
export const unblockTruckSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required()
    .messages({
      'string.min': 'Reason must be at least 10 characters',
      'string.max': 'Reason must not exceed 500 characters',
      'any.required': 'Reason is required for unblocking a truck',
    }),
});

/**
 * Bulk action request
 */
export const bulkActionSchema = Joi.object({
  action: Joi.string().valid('block', 'unblock', 'reverify', 'export').required(),
  rcNumbers: Joi.array().items(Joi.string().length(10)).min(1).max(1000).required()
    .messages({
      'array.min': 'At least one RC number is required',
      'array.max': 'Bulk action limited to 1000 trucks at a time',
    }),
  reason: Joi.string().min(10).max(500).when('action', {
    is: Joi.string().valid('block', 'unblock'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

/**
 * Link trailer request
 */
export const linkTrailerSchema = Joi.object({
  trailerRc: Joi.string().length(10).required()
    .messages({
      'string.length': 'Trailer RC must be 10 characters',
      'any.required': 'Trailer RC is required',
    }),
});

/**
 * Unlink trailer request
 */
export const unlinkTrailerSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required()
    .messages({
      'any.required': 'Reason is required for unlinking trailer',
    }),
});

/**
 * Export trucks request
 */
export const exportTrucksSchema = Joi.object({
  format: Joi.string().valid('csv', 'pdf').required(),
  filters: Joi.object().optional().default({}),
  columns: Joi.array().items(Joi.string()).optional(),
});

/**
 * List trucks query params
 */
export const listTrucksSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(25),
  search: Joi.string().optional(),
  compliance: Joi.string().valid('allowed', 'blocked', 'pending').optional(),
  operator: Joi.string().optional(),
  provider: Joi.string().valid('VAHAN', 'Surepass').optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  bodyType: Joi.string().optional(),
  minGVW: Joi.number().optional(),
  maxGVW: Joi.number().optional(),
  hasTickets: Joi.boolean().optional(),
  sort: Joi.string().valid('rc_number', 'last_verified', 'gvw', 'compliance_status').optional(),
  order: Joi.string().valid('asc', 'desc').optional(),
});

/**
 * Middleware to validate request
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body || req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }

    // Replace request data with validated values
    if (req.body) req.body = value;
    if (req.query) req.query = value;

    next();
  };
};

export default {
  blockTruckSchema,
  unblockTruckSchema,
  bulkActionSchema,
  linkTrailerSchema,
  unlinkTrailerSchema,
  exportTrucksSchema,
  listTrucksSchema,
  validate,
};

