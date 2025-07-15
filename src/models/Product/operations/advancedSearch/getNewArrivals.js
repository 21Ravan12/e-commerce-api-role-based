async function getNewArrivals(Product, options = {}) {
  const { limit = 10, days = 30 } = options;
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return Product.find({ 
    publishedAt: { $gte: dateThreshold },
    status: 'active',
    isAvailable: true
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .lean();
}

module.exports = getNewArrivals;