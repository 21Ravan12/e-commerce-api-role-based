async function searchProducts(Product, query, filters = {}, options = {}) {
  const { page = 1, limit = 25, sort = { score: { $meta: 'textScore' } } } = options;
  const skip = (page - 1) * limit;
  
  const searchFilters = {
    ...filters,
    status: 'active',
    isAvailable: true,
    $text: { $search: query }
  };
  
  const [products, total] = await Promise.all([
    Product.find(searchFilters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select({ score: { $meta: 'textScore' } })
      .lean(),
    Product.countDocuments(searchFilters)
  ]);
  
  return {
    products,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit
  };
}

module.exports = searchProducts;