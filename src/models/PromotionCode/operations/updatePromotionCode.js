const mongoose = require('mongoose');
async function updatePromotionCode(PromotionCode, id, updateData) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid promotion code ID format');
  }

  // Prevent direct status updates
  if (updateData.status) {
    delete updateData.status;
  }

  // Find and update the code
  const promotionCode = await PromotionCode.findById(id);
  if (!promotionCode) {
    throw new Error('Promotion code not found');
  }

  Object.assign(promotionCode, updateData);
  return promotionCode.save();
}

module.exports = updatePromotionCode;