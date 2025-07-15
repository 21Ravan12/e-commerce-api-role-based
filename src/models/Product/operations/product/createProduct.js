async function createProduct(Product, Category, productData, user) {
  // Validate categories exist
  if (productData.categories && productData.categories.length > 0) {
    try {
      const validCategories = await Category.countDocuments({ 
        _id: { $in: productData.categories } 
      });
      if (validCategories !== productData.categories.length) {
        throw new Error('One or more categories are invalid');
      }
    } catch (error) {
      console.error('Error validating categories:', error);
      throw { message: 'Error validating categories', statusCode: 500 };
    }
  }

  // Create new product
  const newProduct = new Product({
    ...productData,
    seller: user._id,
    status: 'active',
    isAvailable: productData.stockQuantity > 0,
    lastUpdatedBy: user._id
  });

  const savedProduct = await newProduct.save();
  
  return {
    id: savedProduct._id,
    name: savedProduct.name,
    status: savedProduct.status,
    sku: savedProduct.sku
  };
}

module.exports = createProduct;