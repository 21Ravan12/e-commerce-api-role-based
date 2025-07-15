const logger = require('../../../../services/logger');
async function createCompleteOrder(Order, orderData) {
    // Required fields validation
    const requiredFields = ['idCustomer', 'items', 'paymentMethod', 'shippingAddress'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Calculate totals if not provided
    const discountedSubtotal = orderData.subtotal - (orderData.discount || 0);
    const tax = orderData.tax || 0; // In real app, this would be calculated
    const finalShippingCost = orderData.shippingCost || 0;
    console.log(discountedSubtotal + '  ' + tax + '  ' + finalShippingCost)
    const total = (discountedSubtotal + tax + finalShippingCost);

    // DEBUG LOGS - VERIFY ALL VALUES
    logger.info('Order Calculation Breakdown:'+ JSON.stringify({
        originalSubtotal: orderData.subtotal,
        discountApplied: orderData.discount || 0,
        discountedSubtotal: discountedSubtotal,
        taxAmount: tax,
        shippingCost: finalShippingCost,
        calculatedTotal: total
    }));

    // Create order with ALL values
    const order = new Order({
        idCustomer: orderData.idCustomer,
        items: orderData.items.map(item => ({
            idProduct: item.idProduct,
            productName: item.productName,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
            appliedCampaigns: item.appliedCampaigns || []
        })),
        status: orderData.status || 'pending',
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus || 'pending',
        paymentId: orderData.paymentId,
        shippingAddress: {
            street: orderData.shippingAddress.street,
            city: orderData.shippingAddress.city,
            state: orderData.shippingAddress.state,
            postalCode: orderData.shippingAddress.postalCode,
            country: orderData.shippingAddress.country
        },
        shippingMethod: orderData.shippingMethod || 'standard',
        subtotal: orderData.subtotal,
        tax: tax,
        shippingCost: finalShippingCost,
        discount: orderData.discount || 0,
        promotion: orderData.promotion || null,
        total: total,
        estimatedDelivery: orderData.estimatedDelivery || null,
        appliedCampaigns: orderData.appliedCampaigns || orderData.items.reduce((acc, item) => {
            return [...acc, ...(item.appliedCampaigns || [])];
        }, [])
    });

    await order.save();
    return order;
}


module.exports = createCompleteOrder;