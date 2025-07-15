const Joi = require('joi');
const mongoose = require('mongoose');
const { Types: { ObjectId } } = mongoose;

// Corrected ObjectId validator
const objectIdValidator = (value, helpers) => {
  if (!ObjectId.isValid(value)) {
    return helpers.error('any.invalid', {
      message: 'must be a valid MongoDB ObjectId'
    });
  }
  return value;
};

// Renamed to avoid confusion with mongoose.ObjectId
const joiObjectId = Joi.string().custom(objectIdValidator, 'ObjectId validation')
  .message('{{#label}} must be a valid MongoDB ObjectId');

  const returnRequestAdminUpdateSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'approved', 'rejected', 'processing', 'completed', 'refunded')
    .messages({
      'any.only': 'Status must be one of: pending, approved, rejected, processing, completed, refunded'
    }),
    
  adminNotes: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Admin notes must be less than 1000 characters'
    }),
    
  returnShippingMethod: Joi.string()
    .valid('customer', 'merchant', "pickup")
    .messages({
      'any.only': 'Shipping method must be either "customer", "merchant" or "pickup"'
    }),
    
  exchangeProductId: Joi.string()
    .when('status', {
      is: 'approved',
      then: Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid product ID format'),
      otherwise: Joi.forbidden().messages({
        'any.unknown': 'Exchange product can only be changed when status is approved'
      })
    }),
    
  // Additional admin-only fields
  refundMethod: Joi.string()
    .valid('original_payment', 'store_credit', 'bank_transfer')
    .messages({
      'any.only': 'Refund method must be one of: original_payment, store_credit, bank_transfer'
    }),
    
  restockingFee: Joi.number()
    .precision(2)
    .min(0)
    .max(100)
    .messages({
      'number.base': 'Restocking fee must be a number',
      'number.min': 'Restocking fee cannot be negative',
      'number.max': 'Restocking fee cannot exceed 100'
    })
  })
  .min(1) // At least one field must be provided
  .messages({
    'object.min': 'At least one field must be provided for update'
  });

module.exports = {
  returnRequestAdminUpdateSchema
};
