async function processRefund(Payment, paymentId, refundData, order = null) {
  try {
    // Input validation
    if (!Payment || !Payment.findById) {
      throw new Error('Invalid Payment model provided');
    }

    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    if (!refundData || typeof refundData !== 'object') {
      throw new Error('Invalid refund data provided');
    }

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error(`Payment not found with ID: ${paymentId}`);
    }

    // If no amount specified and we have order data, use order total
    const refundAmount = refundData.amount || 
                        (order?.total ? order.total : payment.total_amount);

    if (isNaN(refundAmount)) {
      throw new Error('Could not determine valid refund amount');
    }

    if (refundAmount <= 0) {
      throw new Error('Refund amount must be positive');
    }

    // Validate refund amount doesn't exceed payment total
    if (refundAmount > payment.total_amount) {
      throw new Error(
        `Refund amount (${refundAmount}) exceeds payment total (${payment.total_amount})`
      );
    }

    // Check if payment is already fully refunded
    const totalRefunded = payment.refunds.reduce(
      (sum, refund) => sum + refund.amount, 0
    );
    
    if (totalRefunded >= payment.total_amount) {
      return {
        success: false,
        message: 'Payment already fully refunded',
        payment
      };
    }

    // Prepare the refund record
    const refundRecord = {
      amount: refundAmount,
      currency: refundData.currency || payment.currency || 'USD',
      reason: refundData.reason || order?.cancellationReason || 'Customer request',
      processed_at: new Date(),
      processor_refund_id: refundData.processor_refund_id || null,
      orderId: order?._id || null
    };

    // Add refund details
    payment.refunds.push(refundRecord);

    // Update payment status
    const newTotalRefunded = totalRefunded + refundAmount;
    payment.payment_status = newTotalRefunded >= payment.total_amount 
      ? 'refunded' 
      : 'partially_refunded';

    // Save payment record
    const savedPayment = await payment.save();
    
    return {
      success: true,
      message: 'Refund processed successfully',
      refundProcessed: true,
      refundAmount,
      payment: savedPayment,
      order: order || undefined
    };

  } catch (error) {
    // Enhance specific error messages
    if (error.name === 'CastError') {
      error.message = `Invalid payment ID format: ${paymentId}`;
    }

    if (error.name === 'ValidationError') {
      error.message = `Payment validation failed: ${error.message}`;
    }

    return {
      success: false,
      message: error.message,
      refundProcessed: false,
      error: error.name,
      order: order || undefined
    };
  }
}

module.exports = processRefund;