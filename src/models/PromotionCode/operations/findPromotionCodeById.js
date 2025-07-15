const mongoose = require('mongoose');
async function findPromotionCodeById(PromotionCode, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid promotion code ID format');
  }

  return PromotionCode.findById(id)
    .populate('applicableCategories', 'name slug')
    .populate('excludedProducts', 'name sku')
    .populate('eligibleCustomers', 'username email')
    .populate('createdBy', 'username')
    .lean();
}

module.exports = findPromotionCodeById;