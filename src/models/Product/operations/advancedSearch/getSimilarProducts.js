async function getSimilarProducts(Product, productId, options = {}) {
  const { limit = 5 } = options;
  const product = await Product.findById(productId).select('attributes categories');
  
  if (!product) {
    throw { message: 'Product not found', statusCode: 404 };
  }
  
  const attributeNames = product.attributes.map(attr => attr.name);
  const attributeValues = product.attributes.reduce((acc, attr) => {
    acc[attr.name] = attr.values;
    return acc;
  }, {});
  
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
        attributeScore: {
          $reduce: {
            input: "$attributes",
            initialValue: 0,
            in: {
              $cond: [
                { $in: ["$$this.name", attributeNames] },
                {
                  $add: [
                    "$$value",
                    {
                      $size: {
                        $setIntersection: [
                          "$$this.values",
                          attributeValues["$$this.name"] || []
                        ]
                      }
                    }
                  ]
                },
                "$$value"
              ]
            }
          }
        },
        categoryScore: {
          $size: {
            $setIntersection: ["$categories", product.categories]
          }
        },
        totalScore: {
          $add: [
            { $multiply: ["$attributeScore", 2] },
            "$categoryScore"
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
        attributeScore: 1,
        categoryScore: 1,
        totalScore: 1
      }
    }
  ]);
}

module.exports = getSimilarProducts;