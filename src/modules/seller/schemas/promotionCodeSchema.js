const Joi = require('joi');
const mongoose = require('mongoose');
const { Types: { ObjectId } } = mongoose;

// 🔹 Custom ObjectId validator (robust and reusable)
const objectIdValidator = (value, helpers) => {
  if (!ObjectId.isValid(value)) {
    return helpers.error('any.invalid', { message: 'must be a valid MongoDB ObjectId' });
  }
  return value;
};

const objectId = Joi.string()
  .custom(objectIdValidator, 'MongoDB ObjectId validation')
  .message('{{#label}} must be a valid MongoDB ObjectId');

// 🔸 Common fields
const customerEligibilityEnum = ['all', 'new_customers', 'returning_customers', 'specific_customers'];
const promotionTypeEnum = ['fixed', 'percentage', 'free_shipping', 'bundle'];
const statusEnum = ['active', 'inactive', 'expired'];


// ✅ CREATE SCHEMA
const promotionCodeSchema = Joi.object({
  promotionCode: Joi.string().required().min(1).max(50),
  startDate: Joi.date().required().iso(),
  endDate: Joi.date().required().iso().min(Joi.ref('startDate'))
    .messages({ 'date.min': 'endDate must be greater than or equal to startDate' }),

  usageLimit: Joi.number().integer().min(1).allow(null),
  promotionType: Joi.string().required().valid(...promotionTypeEnum),
  promotionAmount: Joi.number().required().min(0),

  minPurchaseAmount: Joi.number().min(0),
  maxDiscountAmount: Joi.number().min(0).allow(null),

  applicableCategories: Joi.array().items(objectId).default([]),
  applicableProducts: Joi.array().items(objectId).default([]),
  excludedProducts: Joi.array().items(objectId).default([]),

  singleUsePerCustomer: Joi.boolean().default(false),

  customerEligibility: Joi.string().valid(...customerEligibilityEnum).default('all'),
  eligibleCustomers: Joi.when('customerEligibility', {
    is: 'specific_customers',
    then: Joi.array().items(objectId).min(1).required(),
    otherwise: Joi.array().items(objectId).default([])
  })
});


// ✅ UPDATE SCHEMA
const promotionCodeUpdateSchema = Joi.object({
  promotionCode: Joi.string().min(1).max(50),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
    .messages({ 'date.min': 'endDate must be greater than or equal to startDate' }),

  usageLimit: Joi.number().integer().min(1).allow(null),
  status: Joi.string().valid(...statusEnum),
  promotionAmount: Joi.number().min(0),

  minPurchaseAmount: Joi.number().min(0),
  maxDiscountAmount: Joi.number().min(0).allow(null),

  applicableCategories: Joi.array().items(objectId),
  applicableProducts: Joi.array().items(objectId),
  excludedProducts: Joi.array().items(objectId),

  singleUsePerCustomer: Joi.boolean(),

  customerEligibility: Joi.string().valid(...customerEligibilityEnum),
  eligibleCustomers: Joi.when('customerEligibility', {
    is: 'specific_customers',
    then: Joi.array().items(objectId).min(1).required(),
    otherwise: Joi.array().items(objectId)
  })
}).min(1);


// ✅ GET / LIST QUERY SCHEMA
const promotionCodeGetSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  status: Joi.string().valid(...statusEnum.concat('upcoming')),
  type: Joi.string().valid('percentage', 'fixed'),

  active: Joi.boolean(),
  search: Joi.string().trim().max(100)
});


// ✅ Exports
module.exports = {
  promotionCodeSchema,
  promotionCodeUpdateSchema,
  promotionCodeGetSchema,
  objectId
};
