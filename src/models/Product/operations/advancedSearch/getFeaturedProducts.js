async function getFeaturedProducts(Product, options = {}) {
  const { limit = 10 } = options;
  
  return Product.find({ 
    isFeatured: true,
    status: 'active',
    isAvailable: true
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .lean();
}

module.exports = getFeaturedProducts;