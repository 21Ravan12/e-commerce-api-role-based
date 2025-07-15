async function getBestSellers(Product, options = {}) {
  const { limit = 10, days } = options;
  let dateFilter = {};
  
  if (days) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    dateFilter = { lastSoldAt: { $gte: dateThreshold } };
  }
  
  return Product.find({ 
    ...dateFilter,
    purchaseCount: { $gt: 0 },
    status: 'active',
    isAvailable: true
  })
  .sort({ purchaseCount: -1 })
  .limit(limit)
  .lean();
}

module.exports = getBestSellers;