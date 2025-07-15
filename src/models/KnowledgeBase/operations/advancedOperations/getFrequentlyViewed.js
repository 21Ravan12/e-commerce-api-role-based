const getFrequentlyViewed = async (Article, { limit = 10, days = 30 } = {}) => {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      const articles = await Article.find({ 
        status: 'published',
        viewCount: { $gt: 0 },
        createdAt: { $gte: dateThreshold }
      })
        .sort({ viewCount: -1 })
        .limit(limit)
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


module.exports = getFrequentlyViewed;