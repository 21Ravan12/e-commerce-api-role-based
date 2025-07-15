async function getDiscountedProducts(Product, options = {}) {
  const { limit = 10 } = options;
  
  return Product.find({ 
    discountedPrice: { $ne: null, $gt: 0 },
    status: 'active',
    isAvailable: true
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .lean();
}

module.exports = getDiscountedProducts;