async function removeFromWishlist(User, Product, mongoose, userId, productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.commerce.wishlist.includes(productId)) {
    return { message: 'Product not in wishlist' };
  }

  await User.findByIdAndUpdate(
    userId,
    { $pull: { 'commerce.wishlist': productId } },
    { new: true }
  );

  const product = await Product.findById(productId);

  return { 
    message: 'Product removed from wishlist',
    productDetails: {
      id: productId,
      name: product?.name || 'Unknown',
      price: product?.price || 0
    }
  };
}

module.exports = removeFromWishlist;