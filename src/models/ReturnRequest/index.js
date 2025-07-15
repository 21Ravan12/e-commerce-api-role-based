const mongoose = require('mongoose');
const returnRequestSchema = require('./schemas/returnRequestSchema');

// Register model if not already registered
const ReturnRequest = mongoose.models.ReturnRequest || mongoose.model('ReturnRequest', returnRequestSchema);

// Import operations
const createReturnRequest = require('./operations/createReturnRequest');
const getReturnRequest = require('./operations/getReturnRequest');
const getReturnRequests = require('./operations/getReturnRequests');
const updateCustomerReturnRequest = require('./operations/updateCustomerReturnRequest');
const updateAdminReturnRequest = require('./operations/updateAdminReturnRequest');
const deleteReturnRequest = require('./operations/deleteReturnRequest');

// Add query helpers
returnRequestSchema.query.byCustomer = function(customerId) {
  return this.where({ customerId });
};

returnRequestSchema.query.byStatus = function(status) {
  return this.where({ status });
};

returnRequestSchema.query.recent = function(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return this.where('createdAt').gte(cutoff);
};

// Export initialized model and operations
module.exports = {
  ReturnRequest,
  createReturnRequest: createReturnRequest.bind(null, ReturnRequest),
  getReturnRequest: getReturnRequest.bind(null, ReturnRequest),
  getReturnRequests: getReturnRequests.bind(null, ReturnRequest),
  updateCustomerReturnRequest: updateCustomerReturnRequest.bind(null, ReturnRequest),
  updateAdminReturnRequest: updateAdminReturnRequest.bind(null, ReturnRequest),
  deleteReturnRequest: deleteReturnRequest.bind(null, ReturnRequest)
};