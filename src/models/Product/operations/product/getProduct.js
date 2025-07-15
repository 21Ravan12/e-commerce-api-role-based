async function getProduct(Product, productId, options = {}) {
  const query = Product.findById(productId);
  
  // Default population
  if (options.populate !== false) {
    query.populate('seller', 'username email avatar')
         .populate('categories', 'name slug')
         .populate('brand', 'name logo');
  }
  
  // Additional population
  if (options.populateRelated) {
    query.populate('relatedProducts', 'name price images')
         .populate('crossSellProducts', 'name price images')
         .populate('upSellProducts', 'name price images');
  }
  
  const product = await query.lean();

  if (!product) {
    throw { message: 'Product not found', statusCode: 404 };
  }

  return product;
}

module.exports = getProduct;