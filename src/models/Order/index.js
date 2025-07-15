const mongoose = require('mongoose');
const orderSchema = require('./schemas/orderSchema');

// Register model if not already registered
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Order Operations
const cancelOrder = require('./operations/cancelOrder');
const fetchAdminOrders = require('./operations/fetchAdminOrders');
const getCustomerOrders = require('./operations/getCustomerOrders');
const getOrder = require('./operations/getOrder');
const updateOrderStatus = require('./operations/updateOrderStatus');

// Order Creation and Processing
const applyPromotionCode = require('./operations/createOrder/applyPromotionCode');
const getCartProductsById = require('./operations/createOrder/getCartProductsById');
const calculateFinalTotals = require('./operations/createOrder/calculateFinalTotals');
const createAndProcessOrder = require('./operations/createOrder/createAndProcessOrder');
const createCompleteOrder = require('./operations/createOrder/createCompleteOrder');
const finalizeOrder = require('./operations/createOrder/finalizeOrder');
const processCartItems = require('./operations/createOrder/processCartItems');
const updateProductStock = require('./operations/createOrder/updateProductStock');
const updateUserWithNewOrder = require('./operations/createOrder/updateUserWithNewOrder');
const verifyStockAvailability = require('./operations/createOrder/verifyStockAvailability');
const adminUpdateOrderStatus = require('./operations/createOrder/adminUpdateOrderStatus');

// Export Order model and related operations
module.exports = {
  Order,
  cancelOrder: cancelOrder.bind(null, Order),
  fetchAdminOrders: fetchAdminOrders.bind(null, Order),
  getCustomerOrders: getCustomerOrders.bind(null, Order),
  getOrder: getOrder.bind(null, Order),
  updateOrderStatus: updateOrderStatus.bind(null, Order),
  adminUpdateOrderStatus: adminUpdateOrderStatus.bind(null, Order),
  applyPromotionCode: applyPromotionCode.bind(null, Order),
  getCartProductsById: getCartProductsById.bind(null),
  calculateFinalTotals: calculateFinalTotals.bind(null, Order),
  createAndProcessOrder: createAndProcessOrder.bind(null, Order, createCompleteOrder),
  createCompleteOrder: createCompleteOrder.bind(null),
  finalizeOrder: finalizeOrder.bind(null, updateUserWithNewOrder, updateProductStock),
  processCartItems: processCartItems.bind(null, getCartProductsById),
  updateProductStock: updateProductStock.bind(null, Order),
  updateUserWithNewOrder: updateUserWithNewOrder.bind(null),
  verifyStockAvailability: verifyStockAvailability.bind(null, Order)
};
