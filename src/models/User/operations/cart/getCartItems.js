const mongoose = require('mongoose');

async function getCartItems(User, userId, options = {}) {

  console.log('getCartItems called with userId:', userId);
  // Validate userId
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new Error('Invalid user ID');
  }

  const query = User.findById(userId)
    .select('commerce.cart updatedAt');

  if (options.populate) {
    query.populate({
      path: 'commerce.cart.product',
      select: options.productFields || 'name price images stock',
      ...(options.populateOptions || {})
    });
  }

  const user = await query.lean();

  if (!user) {
    throw new Error('User not found');
  }

  const cartItems = Array.isArray(user.commerce?.cart) ? user.commerce.cart : [];
  
  let total = 0;
  let itemsCount = 0;

  const items = cartItems.map(item => {
    const itemTotal = item.product?.price ? item.product.price * item.quantity : 0;
    total += itemTotal;
    itemsCount += item.quantity;

    return {
      ...item,
      itemTotal,
      product: item.product || { _id: item.product }
    };
  });

  return {
    items,
    total,
    itemsCount,
    updatedAt: user.updatedAt
  };
}

module.exports = getCartItems;