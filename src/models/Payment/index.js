const mongoose = require('mongoose');
const paymentSchema = require('./schemas/paymentSchema');

// Register model if not already registered
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

// Import operations
const createPayment = require('./operations/createPayment');
const getPayment = require('./operations/getPayment');
const getPayments = require('./operations/getPayments');
const processRefund = require('./operations/processRefund');
const findByOrder = require('./operations/findByOrder');
const getTotalRevenue = require('./operations/getTotalRevenue');

// Export initialized model and operations
module.exports = {
  Payment,
  createPayment: createPayment.bind(null, Payment),
  getPayment: getPayment.bind(null, Payment),
  getPayments: getPayments.bind(null, Payment),
  processRefund: processRefund.bind(null, Payment),
  findByOrder: findByOrder.bind(null, Payment),
  getTotalRevenue: getTotalRevenue.bind(null, Payment)
};