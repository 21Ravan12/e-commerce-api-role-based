async function bulkUpdatePrices(Product, updates) {
  const bulkOps = updates.map(update => {
    const { productId, price } = update;
    if (!productId || price === undefined) {
      throw new Error('Each update must contain productId and price');
    }
    return {
      updateOne: {
        filter: { _id: productId },
        update: {
          $set: { 
            price: price,
            updatedAt: new Date()
          },
          $push: { 
            priceHistory: {
              price,
              date: new Date(),
              isDiscount: false
            }
          }
        }
      }
    };
  });
  
  const result = await Product.bulkWrite(bulkOps);
  
  // Log detailed results
  console.log('Bulk write result:', {
    matched: result.matchedCount,
    modified: result.modifiedCount,
    upserted: result.upsertedCount
  });
  
  if (result.matchedCount !== updates.length) {
    console.warn(`Warning: Only matched ${result.matchedCount} of ${updates.length} products`);
  }
  
  return result;
}

module.exports = bulkUpdatePrices;