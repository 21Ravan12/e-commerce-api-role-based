async function getOrder(Order, orderId, customerId) {
    return Order.findOne({
      _id: orderId,
      idCustomer: customerId
    })
    .select('items status total paymentMethod shippingAddress createdAt estimatedDelivery promotion appliedCampaigns')
    .lean();
}


module.exports = getOrder;