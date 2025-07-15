const Joi = require('joi');
const mongoose = require('mongoose');
const { Types: { ObjectId } } = mongoose;

// Enhanced ObjectId validator with descriptive messages
const objectId = Joi.string().custom((value, helpers) => {
  if (!ObjectId.isValid(value)) {
    return helpers.error('any.invalid', {
      message: 'must be a valid MongoDB ObjectId'
    });
  }
  return value;
}).message('{{#label}} must be a valid MongoDB ObjectId');

// Common validation messages
const messages = {
  string: {
    base: '{{#label}} must be a string',
    empty: '{{#label}} cannot be empty',
    min: '{{#label}} must be at least {#limit} characters',
    max: '{{#label}} cannot exceed {#limit} characters',
    pattern: '{{#label}} contains invalid characters'
  },
  number: {
    base: '{{#label}} must be a number',
    positive: '{{#label}} must be a positive number',
    integer: '{{#label}} must be an integer',
    min: '{{#label}} must be at least {#limit}',
    max: '{{#label}} cannot exceed {#limit}',
    precision: '{{#label}} must have at most {#limit} decimal places'
  },
  array: {
    base: '{{#label}} must be an array',
    min: '{{#label}} must contain at least {#limit} item',
    max: '{{#label}} cannot contain more than {#limit} items'
  },
  object: {
    base: '{{#label}} must be an object'
  },
  boolean: {
    base: '{{#label}} must be a boolean'
  },
  date: {
    base: '{{#label}} must be a valid date'
  }
};

// Common field validations
const nameValidation = Joi.string()
  .trim()
  .min(3)
  .max(100)
  .pattern(/^[\w\s\-&.,()]+$/)
  .messages({
    ...messages.string,
    pattern: '{{#label}} can only contain letters, numbers, spaces, hyphens, ampersands, and basic punctuation'
  });

const descriptionValidation = Joi.string()
  .trim()
  .min(20)
  .max(2000)
  .messages(messages.string);

const shortDescriptionValidation = Joi.string()
  .trim()
  .max(200)
  .messages(messages.string);

const priceValidation = Joi.number()
  .min(0)
  .precision(2)
  .messages({
    ...messages.number,
    precision: '{{#label}} must have at most 2 decimal places'
  });

const stockValidation = Joi.number()
  .integer()
  .min(0)
  .messages(messages.number);

const urlValidation = Joi.string()
  .uri({ scheme: ['http', 'https'] })
  .max(500)
  .messages({
    ...messages.string,
    'string.uri': '{{#label}} must be a valid HTTP/HTTPS URL'
  });

const imageValidation = Joi.object({
  url: urlValidation.required(),
  altText: Joi.string().max(100).allow('').messages(messages.string),
  isPrimary: Joi.boolean().messages(messages.boolean),
  order: Joi.number().integer().min(0).messages(messages.number)
}).messages(messages.object);

const videoValidation = Joi.object({
  url: urlValidation.required(),
  platform: Joi.string().valid('youtube', 'vimeo', 'dailymotion', 'other').default('other'),
  thumbnail: urlValidation
}).messages(messages.object);

const documentValidation = Joi.object({
  name: Joi.string().max(100).messages(messages.string),
  url: urlValidation.required(),
  type: Joi.string().valid('manual', 'specsheet', 'certificate', 'other')
}).messages(messages.object);

const dimensionValidation = Joi.object({
  length: Joi.number().min(0).messages(messages.number),
  width: Joi.number().min(0).messages(messages.number),
  height: Joi.number().min(0).messages(messages.number),
  unit: Joi.string().valid('cm', 'in', 'm', 'mm').default('cm')
}).messages(messages.object);

const specificationValidation = Joi.object({
  key: Joi.string().trim().max(50).required().messages(messages.string),
  value: Joi.string().trim().max(200).required().messages(messages.string),
  group: Joi.string().trim().max(30).messages(messages.string),
  priority: Joi.number().integer().messages(messages.number)
}).messages(messages.object);

const attributeValidation = Joi.object({
  name: Joi.string().trim().max(30).required().messages(messages.string),
  values: Joi.array().items(Joi.string().trim().max(30)).messages(messages.array)
}).messages(messages.object);

const shippingInfoValidation = Joi.object({
  isFreeShipping: Joi.boolean().default(false).messages(messages.boolean),
  weight: Joi.number().min(0).messages(messages.number),
  dimensions: Joi.object({
    type: Joi.string().valid('parcel', 'envelope', 'package', 'pallet').default('parcel')
  }).messages(messages.object),
  handlingTime: Joi.number().integer().min(0).max(30).default(1).messages(messages.number),
  shippingClass: Joi.string().trim().messages(messages.string),
  restrictions: Joi.object({
    countries: Joi.array().items(Joi.string().trim().uppercase()).messages(messages.array),
    zipCodes: Joi.array().items(Joi.string().trim()).messages(messages.array)
  }).messages(messages.object)
}).messages(messages.object);

const warrantyValidation = Joi.object({
  duration: Joi.number().min(0).messages(messages.number),
  unit: Joi.string().valid('days', 'months', 'years').messages(messages.string),
  terms: Joi.string().max(500).messages(messages.string)
}).messages(messages.object);

const priceHistoryValidation = Joi.object({
  price: Joi.number().required().messages(messages.number),
  date: Joi.date().default(Date.now).messages(messages.date),
  isDiscount: Joi.boolean().default(false).messages(messages.boolean)
}).messages(messages.object);

const customFieldValidation = Joi.object({
  fieldName: Joi.string().trim().max(50).required().messages(messages.string),
  fieldValue: Joi.any(),
  fieldType: Joi.string().valid('string', 'number', 'boolean', 'date', 'array', 'object').messages(messages.string)
}).messages(messages.object);

const localizedVersionValidation = Joi.object({
  language: Joi.string().required().messages(messages.string),
  productId: objectId.required()
}).messages(messages.object);

// Status values
const PRODUCT_STATUSES = [
  'draft', 'active', 'published', 'unpublished', 
  'archived', 'banned', 'discontinued'
];

// Currency options
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL', 'MXN'];

// Language options
const LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar'];

// Weight units
const WEIGHT_UNITS = ['g', 'kg', 'lb', 'oz'];

// Main Product Schema
const productSchema = Joi.object({
  // Core Product Information
  name: nameValidation.required(),
  description: descriptionValidation.required(),
  shortDescription: shortDescriptionValidation,
  price: priceValidation.required(),
  discountedPrice: Joi.alternatives().try(
    priceValidation.less(Joi.ref('price')),
    Joi.valid(null)
  ).messages({
    'alternatives.types': 'Discounted price must be a number less than regular price or null',
    'number.less': 'Discounted price must be less than regular price'
  }),
  costPrice: priceValidation,
  currency: Joi.string().valid(...CURRENCIES).default('USD').uppercase().messages({
    'any.only': `Currency must be one of: ${CURRENCIES.join(', ')}`
  }),
  taxRate: Joi.number().min(0).max(100).default(0).messages(messages.number),

  // Inventory & Availability
  stockQuantity: stockValidation.required(),
  lowStockThreshold: stockValidation.default(5),
  sku: Joi.string().uppercase().trim().max(50).messages(messages.string),
  barcode: Joi.string().trim().max(50).messages(messages.string),
  isAvailable: Joi.boolean().default(true).messages(messages.boolean),
  isFeatured: Joi.boolean().default(false).messages(messages.boolean),
  isDigital: Joi.boolean().default(false).messages(messages.boolean),
  digitalDownloadUrl: Joi.when('isDigital', {
    is: true,
    then: urlValidation.required(),
    otherwise: urlValidation.allow('')
  }),
  maxDownloads: Joi.number().integer().min(0).default(3).messages(messages.number),
  downloadExpiryDays: Joi.number().integer().min(0).default(30).messages(messages.number),

  // Media
  images: Joi.array().items(imageValidation).max(10).messages({
    ...messages.array,
    'array.max': 'Cannot upload more than 10 images'
  }),
  videos: Joi.array().items(videoValidation).max(3).messages({
    ...messages.array,
    'array.max': 'Cannot upload more than 3 videos'
  }),
  documents: Joi.array().items(documentValidation).max(5).messages({
    ...messages.array,
    'array.max': 'Cannot upload more than 5 documents'
  }),

  // Categorization
  categories: Joi.array().items(objectId).min(1).required().messages({
    ...messages.array,
    'any.required': 'At least one category is required',
    'array.min': 'At least one category is required'
  }),
  tags: Joi.array().items(
    Joi.string().trim().lowercase().max(30).messages(messages.string)
  ).max(20).messages({
    ...messages.array,
    'array.max': 'Cannot have more than 20 tags'
  }),
  collections: Joi.array().items(objectId).messages(messages.array),

  // Seller Information
  brand: objectId,
  manufacturer: Joi.string().trim().max(100).messages(messages.string),
  supplier: objectId,
  warranty: warrantyValidation,

  // Product Specifications
  specifications: Joi.array().items(specificationValidation).max(50).messages({
    ...messages.array,
    'array.max': 'Cannot have more than 50 specifications'
  }),
  attributes: Joi.array().items(attributeValidation).max(20).messages({
    ...messages.array,
    'array.max': 'Cannot have more than 20 attributes'
  }),
  variants: Joi.array().items(objectId).messages(messages.array),
  parentProduct: objectId,
  weight: Joi.number().min(0).default(0).messages(messages.number),
  weightUnit: Joi.string().valid(...WEIGHT_UNITS).default('g').messages({
    'any.only': `Weight unit must be one of: ${WEIGHT_UNITS.join(', ')}`
  }),
  dimensions: dimensionValidation,
  color: Joi.string().trim().max(30).messages(messages.string),
  size: Joi.string().trim().max(20).messages(messages.string),
  material: Joi.string().trim().max(100).messages(messages.string),

  // Shipping Information
  shippingInfo: shippingInfoValidation,

  // Related Products
  relatedProducts: Joi.array().items(objectId).messages(messages.array),
  crossSellProducts: Joi.array().items(objectId).messages(messages.array),
  upSellProducts: Joi.array().items(objectId).messages(messages.array),
  frequentlyBoughtTogether: Joi.array().items(objectId).messages(messages.array),

  // Ratings & Reviews
  averageRating: Joi.number().min(0).max(5).default(0).precision(1).messages({
    ...messages.number,
    'number.max': 'Rating cannot exceed 5'
  }),
  ratingCount: Joi.number().integer().min(0).default(0).messages(messages.number),
  reviewCount: Joi.number().integer().min(0).default(0).messages(messages.number),
  ratingDistribution: Joi.object({
    1: Joi.number().integer().min(0).default(0).messages(messages.number),
    2: Joi.number().integer().min(0).default(0).messages(messages.number),
    3: Joi.number().integer().min(0).default(0).messages(messages.number),
    4: Joi.number().integer().min(0).default(0).messages(messages.number),
    5: Joi.number().integer().min(0).default(0).messages(messages.number)
  }).messages(messages.object),

  // Sales & Pricing History
  saleCount: Joi.number().integer().min(0).default(0).messages(messages.number),
  priceHistory: Joi.array().items(priceHistoryValidation).messages(messages.array),

  // Metadata
  createdAt: Joi.date().default(Date.now).messages(messages.date),
  updatedAt: Joi.date().default(Date.now).messages(messages.date),
  publishedAt: Joi.date().default(Date.now).messages(messages.date),
  expiryDate: Joi.date().greater(Joi.ref('publishedAt')).messages({
    ...messages.date,
    'date.greater': 'Expiry date must be after publish date'
  }),

  // Moderation & Status
  status: Joi.string().valid(...PRODUCT_STATUSES).default('draft').messages({
    'any.only': `Status must be one of: ${PRODUCT_STATUSES.join(', ')}`
  }),
  isApproved: Joi.boolean().default(false).messages(messages.boolean),
  rejectionReason: Joi.string().max(500).messages(messages.string),
  approvalDate: Joi.date().messages(messages.date),
  approvedBy: objectId,

  // SEO
  seoTitle: Joi.string().trim().max(70).messages(messages.string),
  seoDescription: Joi.string().trim().max(160).messages(messages.string),
  seoKeywords: Joi.array().items(
    Joi.string().trim().max(30).messages(messages.string)
  ).messages(messages.array),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9-]+$/).messages({
    ...messages.string,
    'string.pattern': 'Slug can only contain letters, numbers and hyphens'
  }),
  metaRobots: Joi.string().valid(
    'index, follow',
    'noindex, follow',
    'index, nofollow',
    'noindex, nofollow'
  ).default('index, follow').messages({
    'any.only': 'Invalid meta robots directive'
  }),
  canonicalUrl: urlValidation,

  // Analytics
  viewCount: Joi.number().integer().min(0).default(0).messages(messages.number),
  purchaseCount: Joi.number().integer().min(0).default(0).messages(messages.number),
  wishlistCount: Joi.number().integer().min(0).default(0).messages(messages.number),
  conversionRate: Joi.number().min(0).max(100).default(0).messages({
    ...messages.number,
    'number.max': 'Conversion rate cannot exceed 100%'
  }),
  lastViewed: Joi.date().messages(messages.date),

  // Custom Fields
  customFields: Joi.array().items(customFieldValidation).messages(messages.array),

  // Localization
  language: Joi.string().valid(...LANGUAGES).default('en').messages({
    'any.only': `Language must be one of: ${LANGUAGES.join(', ')}`
  }),
  localizedVersions: Joi.array().items(localizedVersionValidation).messages(messages.array),

  // Audit Log
  lastUpdatedBy: objectId,
  version: Joi.number().integer().min(1).default(1).messages(messages.number)
}).options({
  abortEarly: false,
  stripUnknown: true,
  allowUnknown: false,
  errors: {
    wrap: {
      label: false
    }
  }
});

const productUpdateSchema = productSchema.keys({
  // Override required fields to make them optional for updates
  name: nameValidation,
  description: descriptionValidation,
  price: priceValidation,
  stockQuantity: stockValidation,
  categories: Joi.array().items(objectId).min(1).messages({
    ...messages.array,
    'array.min': 'At least one category is required'
  }),
  seller: objectId
}).min(1) // Require at least one field to be updated
.options({
  abortEarly: false,
  stripUnknown: true
});

// Export with additional utilities
module.exports = {
  productSchema,
  productUpdateSchema,
  objectIdValidator: objectId,
  productStatuses: PRODUCT_STATUSES,
  currencies: CURRENCIES,
  languages: LANGUAGES,
  weightUnits: WEIGHT_UNITS,
  validateProduct: (data) => productSchema.validate(data, { abortEarly: false }),
  validateProductUpdate: (data) => productUpdateSchema.validate(data, { abortEarly: false })
};