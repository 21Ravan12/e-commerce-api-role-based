async function verifyStockAvailability(Campaign, items) {
    const outOfStockItems = [];
    const productIds = items.map(item => item.idProduct);
    
    const products = await Product.find({ 
      _id: { $in: productIds } 
    }).select('_id stockQuantity name');

    for (const item of items) {
      const product = products.find(p => p._id.equals(item.idProduct));
      if (!product) {
        outOfStockItems.push({
          productId: item.idProduct,
          reason: 'Product no longer available'
        });
        continue;
      }

      if (product.stockQuantity < item.quantity) {
        outOfStockItems.push({
          productId: product._id,
          productName: product.name,
          requested: item.quantity,
          available: product.stockQuantity
        });
      }
    }

    return {
      available: outOfStockItems.length === 0,
      outOfStockItems
    };
}

module.exports = verifyStockAvailability;