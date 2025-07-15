async function cancelOrder(Order, orderId, customerId, cancellationReason) {
    if (!cancellationReason) {
      throw new Error('Cancellation reason is required');
    }

    const order = await Order.findOne({
      _id: orderId,
      idCustomer: customerId,
      status: { $in: ['pending', 'processing'] }
    });

    if (!order) {
      throw new Error('Order not found or not eligible for cancellation');
    }

    order.status = 'cancelled';
    order.paymentStatus = 'refunded'; // Assuming refund is processed
    order.cancellationReason = cancellationReason;
    order.cancelledAt = new Date();
    return order.save();
}


module.exports = cancelOrder;