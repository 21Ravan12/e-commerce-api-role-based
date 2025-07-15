const mongoose = require('mongoose');
const promotionCodeSchema = require('./schemas/promotionCodeSchema');

// Register model if not already registered
const PromotionCode = mongoose.models.PromotionCode || mongoose.model('PromotionCode', promotionCodeSchema);

// Import operations
const createProductBasedPromotionCode = require('./operations/createPromotionCode');
const findPromotionCodeById = require('./operations/findPromotionCodeById');
const findPromotionCodes = require('./operations/findPromotionCodes');
const updatePromotionCode = require('./operations/updatePromotionCode');
const deletePromotionCode = require('./operations/deletePromotionCode');

// Export initialized model and operations
module.exports = {
  PromotionCode,
  createProductBasedPromotionCode: createProductBasedPromotionCode.bind(null, PromotionCode),
  findPromotionCodeById: findPromotionCodeById.bind(null, PromotionCode),
  findPromotionCodes: findPromotionCodes.bind(null, PromotionCode),
  updatePromotionCode: updatePromotionCode.bind(null, PromotionCode),
  deletePromotionCode: deletePromotionCode.bind(null, PromotionCode)
};