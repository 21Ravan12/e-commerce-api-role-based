async function bulkUpdateStock(Product, updates, increment = true) {
  const bulkOps = updates.map(update => {
    const { productId, quantity } = update;
    
    return {
      updateOne: {
        filter: { _id: productId },
        update: {
          $inc: { stockQuantity: increment ? quantity : -quantity },
          $set: { 
            isAvailable: increment ? true : { $gt: ['$stockQuantity', quantity] },
            updatedAt: new Date()
          }
        }
      }
    };
  });
  
  return Product.bulkWrite(bulkOps);
}

module.exports = bulkUpdateStock;