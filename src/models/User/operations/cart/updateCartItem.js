async function updateCartItem(User, Product, userId, itemId, updates) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (!user.commerce?.cart) throw new Error('Cart not initialized');

  const itemIndex = user.commerce.cart.findIndex(
    item => item._id?.toString() === itemId
  );
  if (itemIndex === -1) throw new Error('Item not found in cart');

  const updatedCart = [...user.commerce.cart];
  const currentItem = updatedCart[itemIndex];

  if (updates.quantity !== undefined) {
    if (updates.quantity <= 0) throw new Error('Quantity must be > 0');
    currentItem.quantity = updates.quantity;
  }

  if (updates.size) currentItem.size = updates.size;
  if (updates.color) currentItem.color = updates.color;

  await User.findByIdAndUpdate(
    userId,
    { $set: { 'commerce.cart': updatedCart } }
  );

  const product = await Product.findById(currentItem.product);

  return { 
    message: 'Cart item updated',
    itemDetails: {
      id: itemId,
      productId: currentItem.product,
      productName: product?.name || 'Unknown',
      quantity: currentItem.quantity,
      size: currentItem.size,
      color: currentItem.color
    }
  };
}

module.exports = updateCartItem;