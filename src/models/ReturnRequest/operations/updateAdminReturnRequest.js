const mongoose = require('mongoose');
const {Product} = require('../../Product'); // Assuming Product model is in the same directory

async function updateAdminReturnRequest(ReturnRequest, id, updateData) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid return request ID format');
  }

  const returnRequest = await ReturnRequest.findById(id);
  if (!returnRequest) {
    const err = new Error('Return request not found');
    err.statusCode = 404;
    throw err;
  }

  const validTransitions = {
    pending: ['approved', 'rejected'],
    approved: ['processing'],
    processing: ['refunded', 'completed'],
    rejected: [],
    refunded: [],
    completed: []
  };

  if (updateData.status) {
    if (!validTransitions[returnRequest.status]?.includes(updateData.status)) {
      const err = new Error(`Invalid status transition from ${returnRequest.status} to ${updateData.status}`);
      err.statusCode = 400;
      throw err;
    }
  }

  if (updateData.exchangeProductId) {
    if (!mongoose.Types.ObjectId.isValid(updateData.exchangeProductId)) {
      const err = new Error('Invalid exchange product ID format');
      err.statusCode = 400;
      throw err;
    }
    
    const productExists = await Product.exists({ _id: updateData.exchangeProductId });
    if (!productExists) {
      const err = new Error('Exchange product not found');
      err.statusCode = 404;
      throw err;
    }
  }

  const oldValues = {
    status: returnRequest.status,
    refundAmount: returnRequest.refundAmount,
    description: returnRequest.description,
    returnShippingMethod: returnRequest.returnShippingMethod
  };

  Object.assign(returnRequest, updateData);
  const updatedReturnRequest = await returnRequest.save();
  
  return updatedReturnRequest;
}

module.exports = updateAdminReturnRequest;