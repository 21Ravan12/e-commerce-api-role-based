const mongoose = require('mongoose');

async function addToWishlist(User, Product, userId, productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.commerce.wishlist.includes(productId)) {
    return { message: 'Product already in wishlist' };
  }

  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { 'commerce.wishlist': productId } },
    { new: true }
  );

  return { 
    message: 'Product added to wishlist',
    productDetails: {
      id: productId,
      name: product.name,
      price: product.price
    }
  };
}

module.exports = addToWishlist;