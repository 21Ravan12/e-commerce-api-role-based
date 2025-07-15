const searchArticles = async (Article, { 
    query, 
    page = 1, 
    limit = 10,
    category = null
  } = {}) => {
    try {
      const skip = (page - 1) * limit;
      
      const searchQuery = {
        $text: { $search: query },
        status: 'draft'
      };

      if (category) {
        searchQuery.category = category;
      }

      const [articles, total] = await Promise.all([
        Article.find(searchQuery, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .skip(skip)
          .limit(limit)
          .populate('author', 'name')
          .populate('category', 'name slug')
          .lean(),
        Article.countDocuments(searchQuery)
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

module.exports = searchArticles;