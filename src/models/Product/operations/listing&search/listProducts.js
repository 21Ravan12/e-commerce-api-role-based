async function listProducts(Product, {
  filter = {},
  sort = { createdAt: -1 },
  page = 1,
  limit = 25,
  skip,
  populate
}) {
  if (!skip) {
    skip = (page - 1) * limit;
  }

  const query = Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .setOptions({ strictPopulate: false }); // add this line
  
  if (populate) {
    query.populate(populate);
  }

  const [products, total] = await Promise.all([
    query.lean(),
    Product.countDocuments(filter)
  ]);

  return {
    products,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

module.exports = listProducts;