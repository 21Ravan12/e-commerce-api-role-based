const PaymentProcessor = require('../../../../modules/core/services/payment/PaymentProcessor');

async function createAndProcessOrder(Order, createCompleteOrder, orderData, paymentMethod, paymentContext = {}) {
    // Create the order document first
    const order = await createCompleteOrder(Order, orderData);

    try {
        // Prepare payment data
        const paymentData = {
            ipAddress: paymentContext.ip,
            userAgent: paymentContext.userAgent,
            billingAddress: orderData.shippingAddress, // Using shipping as billing if not specified
            ...paymentContext
        };

        // Process payment through PaymentProcessor
        const paymentResult = await PaymentProcessor.process(order, paymentData);

        if (!paymentResult.success) {
            throw new PaymentError('Payment processing failed', {
                paymentMethod,
                amount: order.total,
                originalError: paymentResult.error
            });
        }

        console.log(paymentResult)

        // Update order with payment status
        order.paymentStatus = 'completed';
        order.paymentId = paymentResult.paymentId;
        order.transactionId = paymentResult.transactionId;
        order.status = 'processing';
        order.paymentDetails = {
            method: paymentMethod,
            processor: paymentMethod === 'credit_card' ? 'stripe' : paymentMethod,
            transactionId: paymentResult.transactionId,
            processedAt: new Date()
        };

        await order.save();

        // Return both order and detailed payment result
        return {
            order,
            paymentResult: {
                success: true,
                transactionId: paymentResult.transactionId,
                paymentId: paymentResult.paymentId,
                paymentRecord: paymentResult.paymentRecord,
                amount: order.total,
                currency: order.currency || 'USD'
            }
        };

    } catch (error) {
        // Handle payment failure
        order.status = 'failed';
        order.paymentStatus = 'failed';
        order.failureReason = error.message;
        order.paymentDetails = order.paymentDetails || {};
        order.paymentDetails.error = error.message;
        
        if (error.originalError) {
            order.paymentDetails.processorError = error.originalError.message;
        }

        await order.save();

        // Log the payment failure
        logger.error('Order payment failed', {
            orderId: order._id,
            error: error.message,
            paymentMethod,
            amount: order.total,
            stack: error.stack
        });

        // Re-throw as PaymentError if it isn't already
        if (!(error instanceof PaymentError)) {
            throw new PaymentError(
                error.message, 
                paymentMethod, 
                order.total, 
                error
            );
        }

        throw error;
    }
}


module.exports = createAndProcessOrder;