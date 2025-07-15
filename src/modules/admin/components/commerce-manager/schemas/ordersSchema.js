const Joi = require('joi');

const getAdminOrdersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
  }),
  status: Joi.string()
      .valid(
          'pending',
          'processing',
          'shipped',
          'delivered',
          'cancelled',
          'refunded'
      )
      .optional()
      .messages({
          'any.only': 'Status must be one of: pending, processing, shipped, delivered, cancelled, refunded'
      }),
  idCustomer: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
          'string.pattern.base': 'Customer ID must be a valid ObjectId'
      }),
  dateFrom: Joi.date().iso().optional().messages({
      'date.base': 'From date must be a valid date',
      'date.format': 'From date must be in ISO format (YYYY-MM-DD)'
  }),
  dateTo: Joi.date().iso().optional().messages({
      'date.base': 'To date must be a valid date',
      'date.format': 'To date must be in ISO format (YYYY-MM-DD)'
  }),
  sortBy: Joi.string()
      .valid('createdAt', 'updatedAt', 'total', 'estimatedDelivery')
      .default('createdAt')
      .messages({
          'any.only': 'Sort by must be one of: createdAt, updatedAt, total, estimatedDelivery'
      }),
  sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
          'any.only': 'Sort order must be either asc or desc'
      }),
  minTotal: Joi.number().min(0).optional().messages({
      'number.base': 'Minimum total must be a number',
      'number.min': 'Minimum total cannot be negative'
  }),
  maxTotal: Joi.number().min(0).optional().messages({
      'number.base': 'Maximum total must be a number',
      'number.min': 'Maximum total cannot be negative'
  })
}).options({ abortEarly: false });

const updateAdminOrderSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
    .messages({
      'any.only': 'Status must be one of: pending, processing, shipped, delivered, cancelled, refunded'
    }),
  paymentStatus: Joi.string()
    .valid('pending', 'completed', 'failed', 'refunded')
    .messages({
      'any.only': 'Payment status must be one of: pending, completed, failed, refunded'
    }),
  shippingAddress: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    postalCode: Joi.string(),
    country: Joi.string()
  }).messages({
    'object.base': 'Shipping address must be an object'
  }),
  shippingMethod: Joi.string()
    .valid('standard', 'express', 'next_day')
    .messages({
      'any.only': 'Shipping method must be one of: standard, express, next_day'
    }),
  adminNotes: Joi.string().max(1000).optional().messages({
    'string.max': 'Admin notes cannot exceed 1000 characters'
  }),
  forceUpdate: Joi.boolean().default(false).messages({
    'boolean.base': 'Force update must be a boolean'
  })
}).min(1).options({ abortEarly: false });

module.exports = { getAdminOrdersSchema, updateAdminOrderSchema };