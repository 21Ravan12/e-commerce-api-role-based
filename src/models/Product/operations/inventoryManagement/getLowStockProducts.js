async function getLowStockProducts(Product, limit = 50) {  
  console.log('Fetching low stock products with limit:', limit);
  return Product.aggregate([
    {
      $match: {
        status: { $in: ['active', 'published'] }
      }
    },
    {
      $addFields: {
        isLowStock: {
          $and: [
            { $gt: ["$stockQuantity", 0] },
            { $lte: ["$stockQuantity", "$lowStockThreshold"] }
          ]
        }
      }
    },
    {
      $match: {
        isLowStock: true
      }
    },
    {
      $sort: {
        stockQuantity: 1
      }
    },
    {
      $limit: limit
    },
    {
      $project: {
        name: 1,
        sku: 1,
        stockQuantity: 1,
        lowStockThreshold: 1,
        price: 1
      }
    }
  ]);
}

module.exports = getLowStockProducts;