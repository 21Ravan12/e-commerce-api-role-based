async function updateOrderStatus(Order, status, orderId) {
    if (!status) {
      throw new Error('Status is required');
    }

    const validStatuses = ['processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Update status and set timestamps for certain status changes
    order.status = status;
    if (status === 'shipped') {
      order.shippedAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'completed') {
      order.completedAt = new Date();
    }

    return order.save();
}


module.exports = updateOrderStatus;