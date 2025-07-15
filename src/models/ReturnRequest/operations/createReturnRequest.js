async function createReturnRequest(ReturnRequest, returnRequestData) {
  const returnRequestExists = await ReturnRequest.findOne({
    customerId: returnRequestData.customerId,
    orderId: returnRequestData.orderId,
  });
      
  if (returnRequestExists) {
    const existsError = new Error('Return request already exists for this order');
    existsError.statusCode = 409;
    throw existsError;
  }
  const returnRequest = new ReturnRequest(returnRequestData);
  return await returnRequest.save();
}

module.exports = createReturnRequest;
