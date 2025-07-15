async function deleteProduct(Product, productId, user) {
  const product = await Product.findById(productId);
  if (!product) {
    throw { message: 'Product not found', statusCode: 404 };
  }

  // Check ownership or admin role
  if (String(product.seller) !== String(user._id) && user.role !== 'admin') {
    throw { message: 'Not authorized to delete this product', statusCode: 403 };
  }

  // Soft delete
  product.status = 'archived';
  product.isAvailable = false;
  product.lastUpdatedBy = user._id;
  await product.save();

  return {
    id: product._id,
    status: product.status,
    deletedAt: new Date()
  };
}

module.exports = deleteProduct;