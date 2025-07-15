module.exports = async function adminUpdateOrderStatus(Order, { orderId, updateData, adminId, forceUpdate = false }) {
    try {
        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return { error: 'Order not found', notFound: true, statusCode: 404 };
        }

        // Save old values for audit
        const oldValues = {
            status: order.status,
            paymentStatus: order.paymentStatus,
            adminNotes: order.adminNotes,
            // Add more fields as needed
        };

        // Update fields (customize as needed)
        if (updateData.status) order.status = updateData.status;
        if (updateData.paymentStatus) order.paymentStatus = updateData.paymentStatus;
        if (updateData.adminNotes) order.adminNotes = updateData.adminNotes;
        order.updatedBy = adminId;
        order.updatedAt = new Date();

        // Example: handle forceUpdate or refund logic here if needed

        // Save the order
        await order.save();

        // Prepare new values for audit
        const newValues = {
            status: order.status,
            paymentStatus: order.paymentStatus,
            adminNotes: order.adminNotes,
            // Add more fields as needed
        };

        return {
            updatedOrder: order,
            oldValues,
            newValues,
            refundProcessed: false, // Set true if refund logic is added
            refundDetails: null     // Add refund details if needed
        };
    } catch (error) {
        return { error: error.message, statusCode: 500 };
    }
};