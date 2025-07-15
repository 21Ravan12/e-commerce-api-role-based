async function fetchAdminOrders(Order, customerId, page = 1, limit = 10, query = {}, sortBy = 'createdAt', sortOrder = 'desc') {
    // If customerId is provided, add to query
    if (customerId) {
        query.idCustomer = customerId;
    }

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate({
                path: 'idCustomer',
                select: 'firstName lastName email'
            })
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Order.countDocuments(query)
    ]);

    return {
        orders,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
    };
}


module.exports = fetchAdminOrders;