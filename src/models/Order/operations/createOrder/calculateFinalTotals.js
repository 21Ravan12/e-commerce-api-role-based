const {calculateTax} = require('../../../../modules/costumer/services/service');

async function calculateFinalTotals(subtotal, discount, shippingAddress, shippingCost) {
    // Calculate tax based on shipping address
    const taxRate = await calculateTax(shippingAddress);
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * taxRate;

    const total = taxableAmount + tax + shippingCost;

    return { tax, total };
}

module.exports = calculateFinalTotals;