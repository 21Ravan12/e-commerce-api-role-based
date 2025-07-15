async function getTrendingProducts(Product, options = {}) {
  const { limit = 10, days = 7 } = options;
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return Product.find({ 
    lastViewed: { $gte: dateThreshold },
    viewCount: { $gt: 0 },
    status: 'active',
    isAvailable: true
  })
  .sort({ viewCount: -1 })
  .limit(limit)
  .lean();
}

module.exports = getTrendingProducts;