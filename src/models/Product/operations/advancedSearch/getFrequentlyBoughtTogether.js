async function getFrequentlyBoughtTogether(Product, productId, options = {}) {
  const { limit = 5 } = options;
  
  return Product.find({
    _id: { $ne: productId },
    frequentlyBoughtTogether: productId,
    status: 'active',
    isAvailable: true
  })
  .sort({ purchaseCount: -1 })
  .limit(limit)
  .lean();
}

module.exports = getFrequentlyBoughtTogether;