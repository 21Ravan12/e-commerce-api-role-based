async function updateCustomerReturnRequest(ReturnRequest, id, userId, updateData) {
  const returnRequest = await ReturnRequest.findById(id);
  if (!returnRequest) {
    throw new Error('Return request not found');
  }

  if (!returnRequest.customerId.equals(userId)) {
    throw new Error('Unauthorized to update this return request');
  }

  if (returnRequest.status !== 'pending') {
    throw new Error('Only pending return requests can be updated by customers');
  }

  const allowedFields = ['description', 'returnShippingMethod'];
  const filteredUpdate = {};
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredUpdate[field] = updateData[field];
    }
  }

  const oldValues = {
    description: returnRequest.description,
    returnShippingMethod: returnRequest.returnShippingMethod
  };

  Object.assign(returnRequest, filteredUpdate);
  const updatedReturnRequest = await returnRequest.save();
  
  return {
    returnRequest: updatedReturnRequest,
    oldValues
  };
}

module.exports = updateCustomerReturnRequest;