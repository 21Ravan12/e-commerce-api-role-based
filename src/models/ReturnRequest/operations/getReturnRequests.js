async function getReturnRequests(ReturnRequest, {
  query,
  sort = { createdAt: -1 },
  page = 1,
  limit = 10
}) {

  const skip = (page - 1) * limit;

  const [returnRequests, total] = await Promise.all([
    ReturnRequest.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'username email')
      .populate('orderId', 'totalAmount status')
      .populate('exchangeProductId', 'name price'),
    ReturnRequest.countDocuments(query)
  ]);

  return {
    returnRequests,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit
  };
}

module.exports = getReturnRequests;