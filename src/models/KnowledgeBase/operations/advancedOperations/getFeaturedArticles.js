const getFeaturedArticles = async (Article, { limit = 10 } = {}) => {
    try {
      const articles = await Article.find({ 
        isFeatured: true, 
        status: 'published' 
      })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .populate('author', 'name email')
        .populate('category', 'name slug')
        .lean();

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

module.exports = getFeaturedArticles;