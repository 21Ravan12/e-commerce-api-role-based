async function findPromotionCodes(PromotionCode, filter = {}, page = 1, limit = 10) {
  const [promotionCodes, total] = await Promise.all([
    PromotionCode.find(filter)
      .sort({ startDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    PromotionCode.countDocuments(filter)
  ]);

  return {
    promotionCodes,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
}

module.exports = findPromotionCodes;