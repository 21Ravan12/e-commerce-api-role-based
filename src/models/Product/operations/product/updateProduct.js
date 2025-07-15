const { Category } = require('../../../Product');

async function updateProduct(Product, productId, updateData, user) {
  const product = await Product.findById(productId);
  if (!product) {
    throw { message: 'Product not found', statusCode: 404 };
  }

  // Check ownership or admin role
  if (String(product.seller) !== String(user._id) && user.role !== 'admin') {
    throw { message: 'Not authorized to update this product', statusCode: 403 };
  }

  // Validate category if being updated
  if (updateData.categories && updateData.categories.length > 0) {
    const categoriesExist = await Category.countDocuments({ 
      _id: { $in: updateData.categories } 
    }) === updateData.categories.length;
        
    if (!categoriesExist) {
      throw { message: 'One or more specified categories do not exist', statusCode: 400 };
    }
  }

  // Track changes
  const changes = {};
  Object.keys(updateData).forEach(key => {
    if (JSON.stringify(product[key]) !== JSON.stringify(updateData[key])) {
      changes[key] = {
        old: product[key],
        new: updateData[key]
      };
    }
  });

  // Update fields
  Object.assign(product, updateData);
  product.lastUpdatedBy = user._id;
  const updatedProduct = await product.save();

  return {
    product: updatedProduct,
    changes
  };
}

module.exports = updateProduct;