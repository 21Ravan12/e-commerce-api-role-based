async function getRelatedProducts(Product, productId, options = {}) {
  const { limit = 5 } = options;
  const product = await Product.findById(productId).select('categories tags');
  
  if (!product) {
    throw { message: 'Product not found', statusCode: 404 };
  }
  
  return Product.aggregate([
    {
      $match: {
        _id: { $ne: product._id },
        categories: { $in: product.categories },
        status: 'active',
        isAvailable: true
      }
    },
    {
      $addFields: {
        categoryScore: {
          $size: {
            $setIntersection: ["$categories", product.categories]
          }
        },
        tagScore: {
          $size: {
            $setIntersection: ["$tags", product.tags]
          }
        },
        totalScore: {
          $add: [
            { $multiply: ["$categoryScore", 3] },
            "$tagScore"
          ]
        }
      }
    },
    { $sort: { totalScore: -1, createdAt: -1 } },
    { $limit: limit },
    {
      $project: {
        name: 1,
        price: 1,
        discountedPrice: 1,
        images: 1,
        averageRating: 1,
        categoryScore: 1,
        tagScore: 1,
        totalScore: 1
      }
    }
  ]);
}

module.exports = getRelatedProducts;