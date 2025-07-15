const Joi = require('joi');
const mongoose = require('mongoose');

// Custom ObjectId validator
function objectIdValidator(value, helpers) {
  if (!/^[0-9a-fA-F]{24}$/.test(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}

const objectId = Joi.string().custom(objectIdValidator, 'ObjectId validation');

const sellerCampaignSchema = Joi.object({
  campaignName: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .pattern(/^[a-zA-Z0-9\s\-]+$/)
    .required()
    .messages({
      'string.base': '{{#label}} must be a string',
      'string.empty': '{{#label}} cannot be empty',
      'string.min': '{{#label}} must be at least 3 characters',
      'string.max': '{{#label}} must be at most 100 characters',
      'string.pattern.base': '{{#label}} must only contain alphanumeric characters, spaces, and hyphens',
      'any.required': '{{#label}} is required'
    }),

  campaignType: Joi.string()
    .valid('fixed', 'percentage', 'free_shipping', 'bundle', 'buy_x_get_y')
    .required()
    .messages({
      'any.only': '{{#label}} must be one of DISCOUNT, FLASH_SALE, BUNDLE, or SEASONAL',
      'any.required': '{{#label}} is required'
    }),

  startDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.base': '{{#label}} must be a valid date',
      'date.min': '{{#label}} must be in the future',
      'any.required': '{{#label}} is required'
    }),

  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .required()
    .messages({
      'date.greater': '{{#label}} must be after start date',
      'any.required': '{{#label}} is required'
    }),

  campaignAmount: Joi.number()
    .min(1)
    .max(100)
    .required()
    .messages({
      'number.base': '{{#label}} must be a number',
      'number.min': '{{#label}} must be at least 1',
      'number.max': '{{#label}} must be at most 100',
      'any.required': '{{#label}} is required'
    }),

  products: Joi.array()
    .items(objectId)
    .min(1)
    .required()
    .messages({
      'array.base': '{{#label}} must be an array of product IDs',
      'array.min': '{{#label}} must contain at least one valid product ID',
      'any.required': '{{#label}} is required'
    }),

  status: Joi.string()
    .valid('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED')
    .default('DRAFT')
    .messages({
      'any.only': '{{#label}} must be one of DRAFT, ACTIVE, PAUSED, or COMPLETED'
    }),

  description: Joi.string()
    .max(500)
    .trim()
    .messages({
      'string.max': '{{#label}} must be less than 500 characters'
    }),

  termsAndConditions: Joi.string()
    .max(1000)
    .trim()
    .messages({
      'string.max': '{{#label}} must be less than 1000 characters'
    })
});

const sellerCampaignUpdateSchema = Joi.object({
  campaignName: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .pattern(/^[a-zA-Z0-9\s\-]+$/)
    .messages({
      'string.pattern.base': '{{#label}} must only contain alphanumeric characters, spaces, and hyphens',
      'string.min': '{{#label}} must be at least 3 characters',
      'string.max': '{{#label}} must be at most 100 characters'
    }),

  campaignType: Joi.string()
    .valid('DISCOUNT', 'FLASH_SALE', 'BUNDLE', 'SEASONAL')
    .messages({
      'any.only': '{{#label}} must be one of DISCOUNT, FLASH_SALE, BUNDLE, or SEASONAL'
    }),

  startDate: Joi.date()
    .min('now')
    .messages({
      'date.min': '{{#label}} must be in the future'
    }),

  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .messages({
      'date.greater': '{{#label}} must be after start date'
    }),

  discountValue: Joi.number()
    .min(1)
    .max(100)
    .messages({
      'number.min': '{{#label}} must be at least 1',
      'number.max': '{{#label}} must be at most 100'
    }),

  products: Joi.array()
    .items(objectId)
    .min(1)
    .messages({
      'array.min': '{{#label}} must contain at least one valid product ID',
      'array.base': '{{#label}} must be an array of product IDs'
    }),

  status: Joi.string()
    .valid('darft', 'active', 'paused', 'completed')
    .messages({
      'any.only': '{{#label}} must be one of DRAFT, ACTIVE, PAUSED, or COMPLETED'
    }),

  description: Joi.string()
    .max(500)
    .trim()
    .messages({
      'string.max': '{{#label}} must be less than 500 characters'
    }),

  termsAndConditions: Joi.string()
    .max(1000)
    .trim()
    .messages({
      'string.max': '{{#label}} must be less than 1000 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

module.exports = {
  sellerCampaignSchema,
  sellerCampaignUpdateSchema
};
