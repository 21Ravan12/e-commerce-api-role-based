async function getReturnRequest(ReturnRequest,{ id, userId, userRole }) {
  console.log('getReturnRequest', id, userId, userRole);
  const returnRequest = await ReturnRequest.findById(id)
    .populate('customerId', 'username email')
    .populate('orderId', 'totalAmount status')
    .populate('exchangeProductId', 'name price');
  
  if (!returnRequest) {
    throw new Error('Return request not found');
  }

  if (!['admin', 'moderator'].includes(userRole) && !returnRequest.customerId._id.equals(userId)) {
    throw new Error('Unauthorized to view this return request');
  }  

  return returnRequest;
}

module.exports = getReturnRequest;