const getPopularArticles = async (Article, { limit = 10 } = {}) => {
    try {
      const articles = await Article.aggregate([
        { $match: { status: 'published' } },
        { $addFields: { popularityScore: { $add: ['$viewCount', '$helpfulCount'] } } },
        { $sort: { popularityScore: -1 } },
        { $limit: limit },
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
        { $unwind: '$author' },
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { 
          'author.password': 0,
          'author.__v': 0,
          'category.__v': 0
        }}
      ]);

      return {
        success: true,
        data: articles,
        count: articles.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
 };


module.exports = getPopularArticles;