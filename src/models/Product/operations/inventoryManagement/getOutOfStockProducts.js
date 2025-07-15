async function getOutOfStockProducts(Product, options = {}) {
  const { limit = 50 } = options;
  
  return Product.find({
    stockQuantity: 0,
    status: { $in: ['active', 'published'] }
  })
  .sort({ updatedAt: -1 })
  .limit(limit)
  .select('name sku price')
  .lean();
}

module.exports = getOutOfStockProducts;