async function clearCart(User, userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Initialize empty cart if it doesn't exist
  if (!user.commerce) user.commerce = {};
  
  await User.findByIdAndUpdate(
    userId,
    { $set: { 'commerce.cart': [] } },
    { new: true }
  );

  return { 
    message: 'Cart cleared',
    itemsRemoved: user.commerce.cart?.length || 0
  };
}

module.exports = clearCart;