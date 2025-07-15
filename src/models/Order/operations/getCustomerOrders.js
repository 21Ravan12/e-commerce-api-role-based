async function getCustomerOrders(Order, customerId, page = 1, limit = 10, status = null) {
    // Validate inputs
    if (!customerId) {
      throw new Error('Customer ID is required');
    } 
    
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, Math.min(parseInt(limit), 100)); // Cap limit at 100
    
    // Create base query
    const query = { idCustomer: customerId };
    if (status) query.status = status;
    
    // Get total count of matching orders
    const total = await Order.countDocuments(query);
    
    // Get paginated orders with essential fields
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('_id items status total paymentMethod shippingAddress createdAt estimatedDelivery paymentStatus trackingNumber')
      .populate({
        path: 'items.idProduct',
        select: 'name mainImage slug' // Only get essential product info
      })
      .lean();
    
    return {
      orders,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
}


module.exports = getCustomerOrders;