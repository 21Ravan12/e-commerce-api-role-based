const listArticles = async (Article, { 
    page = 1, 
    limit = 10, 
    status = 'published',
    category = null,
    sortBy = 'publishedAt',
    sortOrder = 'desc'
  } = {}) => {
    try {
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const query = { status };
      if (category) {
        query.category = category;
      }

      const [articles, total] = await Promise.all([
        Article.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('author', 'name')
          .populate('category', 'name slug')
          .lean(),
        Article.countDocuments(query)
      ]);

      return {
        success: true,
        data: articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = listArticles;