const User = require('../../../User');
const logger = require('../../../../services/logger');

async function finalizeOrder(updateUserWithNewOrder, updateProductStock, orderId, userId, orderItems, paymentResult, paymentMethod, promotionCode) {
    // Update user's orders and clear cart
    await User.clearCart(userId);
    await updateUserWithNewOrder(userId, orderId);

    // Update product stock
    await updateProductStock(orderItems);

    // Record transaction if payment was successful
    if (paymentResult.success) {
        const paymentData = {
            order_id: orderId,
            customer_id: userId,
            payment_id: paymentResult.paymentId || paymentResult.transactionId,
            payment_status: 'approved', // Maps to 'completed' in your schema enum
            payment_method: paymentMethod,
            total_amount: paymentResult.amount,
            currency: paymentResult.currency || 'USD',
            description: `Payment for order ${orderId}`,
            processor_response: {
                transaction_id: paymentResult.transactionId,
                status: paymentResult.status || 'approved'
            },
            metadata: {
                ip_address: paymentResult.ipAddress,
                user_agent: paymentResult.userAgent
            }
        };

        // Add promotion code if available
        if (promotionCode) {
            paymentData.metadata.promotion_code = promotionCode;
        }

        // Add billing address if available in paymentResult
        if (paymentResult.billingAddress) {
            paymentData.billing_address = {
                recipient_name: paymentResult.billingAddress.recipientName || 
                               paymentResult.billingAddress.name || 
                               `${paymentResult.billingAddress.firstName} ${paymentResult.billingAddress.lastName}`,
                line1: paymentResult.billingAddress.line1 || paymentResult.billingAddress.street,
                line2: paymentResult.billingAddress.line2 || '',
                city: paymentResult.billingAddress.city,
                state: paymentResult.billingAddress.state,
                postal_code: paymentResult.billingAddress.postalCode || paymentResult.billingAddress.zip,
                country_code: paymentResult.billingAddress.countryCode || paymentResult.billingAddress.country
            };
        }

    }
}

module.exports = finalizeOrder;