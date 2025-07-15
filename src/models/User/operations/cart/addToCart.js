const mongoose = require('mongoose');

async function addToCart(User, Product, userId, productId, quantity = 1, options = {}) {
  // Validate product ID
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }

  // Get product
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Get user
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Initialize cart if needed
  if (!user.commerce) user.commerce = {};
  if (!Array.isArray(user.commerce.cart)) {
    user.commerce.cart = [];
  }

  // Check for existing item
  const existingItemIndex = user.commerce.cart.findIndex(
    item => item.product.toString() === productId
  );

  let updatedCart;
  if (existingItemIndex >= 0) {
    updatedCart = [...user.commerce.cart];
    updatedCart[existingItemIndex].quantity += quantity;
    
    if (options.size) {
      updatedCart[existingItemIndex].size = options.size;
    }
    if (options.color) {
      updatedCart[existingItemIndex].color = options.color;
    }
  } else {
    const newItem = {
      _id: new mongoose.Types.ObjectId(),
      product: productId,
      quantity,
      addedAt: new Date(),
      ...options
    };
    updatedCart = [...user.commerce.cart, newItem];
  }

  await User.findByIdAndUpdate(
    userId,
    { $set: { 'commerce.cart': updatedCart } },
    { new: true }
  );

  return { 
    message: 'Product added to cart',
    productDetails: {
      id: productId,
      name: product.name,
      price: product.price,
      quantity: existingItemIndex >= 0 ? updatedCart[existingItemIndex].quantity : quantity
    }
  };
}

module.exports = addToCart;