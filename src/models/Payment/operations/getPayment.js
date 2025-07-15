async function getPayment(Payment, paymentId) {
  return Payment.findById(paymentId)
}

module.exports = getPayment;