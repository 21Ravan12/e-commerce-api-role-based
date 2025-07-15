const mongoose = require('mongoose');
const getAverageRating = async (Rating, articleId) => {
    try {
      const result = await Rating.aggregate([
        { $match: { article: new mongoose.Types.ObjectId(articleId) } },
        { $group: {
            _id: null,
            average: { $avg: '$rating' },
            count: { $sum: 1 },
            distribution: {
              $push: '$rating'
            }
          }
        },
        { $project: {
            _id: 0,
            average: { $round: ['$average', 1] },
            count: 1,
            distribution: {
              $reduce: {
                input: [1, 2, 3, 4, 5],
                initialValue: [],
                in: {
                  $concatArrays: [
                    '$$value',
                    [{
                      rating: '$$this',
                      count: {
                        $size: {
                          $filter: {
                            input: '$distribution',
                            as: 'r',
                            cond: { $eq: ['$$r', '$$this'] }
                          }
                        }
                      }
                    }]
                  ]
                }
              }
            }
          }
        }
      ]);

      if (result.length === 0) {
        return {
          success: true,
          data: {
            average: 0,
            count: 0,
            distribution: [1, 2, 3, 4, 5].map(r => ({ rating: r, count: 0 }))
          }
        };
      }

      return {
        success: true,
        data: result[0]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = getAverageRating;