const mongoose = require('mongoose');
async function removeFromCart(User, Product, userId, itemId) {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new Error('Invalid item ID');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Ensure cart exists and is an array
  if (!user.commerce?.cart || !Array.isArray(user.commerce.cart)) {
    throw new Error('Cart not properly initialized');
  }

  const itemIndex = user.commerce.cart.findIndex(
    item => item._id && item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  const removedItem = user.commerce.cart[itemIndex];
  const updatedCart = user.commerce.cart.filter(
    item => item._id.toString() !== itemId
  );

  await User.findByIdAndUpdate(
    userId,
    { $set: { 'commerce.cart': updatedCart } },
    { new: true }
  );

  const product = await Product.findById(removedItem.product);

  return { 
    message: 'Item removed from cart',
    itemDetails: {
      id: itemId,
      productId: removedItem.product,
      productName: product?.name || 'Unknown',
      quantity: removedItem.quantity
    }
  };
}

module.exports = removeFromCart;