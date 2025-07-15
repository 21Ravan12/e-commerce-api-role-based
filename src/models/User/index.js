const mongoose = require('mongoose');
const userSchema = require('./schemas/userSchema');
const { Product } = require('../Product');

// Import all operations
const findUser = require('./operations/other/findUser');
const register = require('./operations/other/register');
const changePassword = require('./operations/other/changePassword');
const updateUser = require('./operations/other/updateUser');
const updateSensitiveUser = require('./operations/other/updateSensitiveUser');
const deleteAccount = require('./operations/other/deleteAccount');
const linkSocialAccount = require('./operations/other/linkSocialAccount');
const unlinkSocialAccount = require('./operations/other/unlinkSocialAccount');

// Import cart operations
const addToCart = require('./operations/cart/addToCart');
const updateCartItem = require('./operations/cart/updateCartItem');
const getCartItems = require('./operations/cart/getCartItems');
const removeFromCart = require('./operations/cart/removeFromCart');
const clearCart = require('./operations/cart/clearCart');

// Import wishlist operations
const addToWishlist = require('./operations/wishlist/addToWishlist');
const removeFromWishlist = require('./operations/wishlist/removeFromWishlist');
const getWishlistItems = require('./operations/wishlist/getWishlist');

// Import admin operations
const assignRoles = require('./operations/admin/assignRoles');
const getUser = require('./operations/admin/getUser');
const listUsers = require('./operations/admin/listUsers');
const updateUserStatus = require('./operations/admin/updateUser');

// Register model
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Export model and operations
module.exports = {
  User,
  findUser: findUser.bind(null, User),
  register: register.bind(null, User),
  changePassword: changePassword.bind(null, User),
  updateUser: updateUser.bind(null, User),
  updateSensitiveUser: updateSensitiveUser.bind(null, User),
  deleteAccount: deleteAccount.bind(null, User),
  linkSocialAccount: linkSocialAccount.bind(null, User),
  unlinkSocialAccount: unlinkSocialAccount.bind(null, User),
  addToCart: addToCart.bind(null, User, Product),
  updateCartItem: updateCartItem.bind(null, User, Product),
  getCartItems: getCartItems.bind(null, User),
  removeFromCart: removeFromCart.bind(null, User, Product),
  clearCart: clearCart.bind(null, User),
  addToWishlist: addToWishlist.bind(null, User, Product),
  removeFromWishlist: removeFromWishlist.bind(null, User, Product, mongoose),
  getWishlistItems: getWishlistItems.bind(null, User, Product),
  assignRoles: assignRoles.bind(null, User),
  getUser: getUser.bind(null, User),
  listUsers: listUsers.bind(null, User),
  updateUserStatus: updateUserStatus.bind(null, User),
};