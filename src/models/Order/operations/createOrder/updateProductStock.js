const {Product} = require('../../../Product');

async function updateProductStock(items) {
    if (!items.every(item => item.idProduct && item.quantity)) {
      throw new Error('Items must contain idProduct and quantity');
    }

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { 
          _id: item.idProduct,
          stockQuantity: { $gte: item.quantity }
        },
        update: { $inc: { stockQuantity: -item.quantity } }
      }
    }));

    return Product.bulkWrite(bulkOps);
}

module.exports = updateProductStock;