async function createPayment(Payment, paymentData) {
  const payment = await new Payment({
    ...paymentData,
    payment_date: paymentData.payment_date || new Date()
  });

  await payment.save();

  return payment;
}

module.exports = createPayment;