async function getWishlistItems(User, Product, userId, options = {}) {
  const user = await User.findById(userId)
    .select('commerce.wishlist')
    .populate({
      path: 'commerce.wishlist',
      select: options.productFields || 'name price images stock',
      ...(options.populateOptions || {})
    })
    .lean();

  if (!user) {
    throw new Error('User not found');
  }

  return {
    items: user.commerce?.wishlist || [],
  };
}

module.exports = getWishlistItems;