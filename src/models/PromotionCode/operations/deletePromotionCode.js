const mongoose = require('mongoose');
async function deletePromotionCode(PromotionCode, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid promotion code ID format');
  }

  const promotionCode = await PromotionCode.findById(id);
  if (!promotionCode) {
    throw new Error('Promotion code not found');
  }

  if (promotionCode.usageCount > 0) {
    throw new Error('Cannot delete promotion code that has been used');
  }

  await PromotionCode.deleteOne({ _id: id });
  return {
    id: promotionCode._id,
    code: promotionCode.promotionCode,
    type: promotionCode.promotionType
  };
}

module.exports = deletePromotionCode;