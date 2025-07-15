async function getProductsByCategory(Product, categoryId, options = {}) {
  const { limit = 50, sort = { isFeatured: -1, createdAt: -1 } } = options;
  
  return Product.find({ 
    categories: categoryId,
    status: 'active',
    isAvailable: true
  })
  .sort(sort)
  .limit(limit)
  .populate('seller', 'username')
  .lean();
}

module.exports = getProductsByCategory;