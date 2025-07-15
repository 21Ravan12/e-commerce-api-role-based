async function findByOrder(Payment, orderId) {
  return Payment.find({ order_id: orderId })
    .populate('customer_id', 'name email');
}

module.exports = findByOrder;