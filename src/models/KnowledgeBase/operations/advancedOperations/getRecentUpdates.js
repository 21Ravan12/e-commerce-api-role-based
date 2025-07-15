const getRecentUpdates = async (Article, { limit = 10, days = 30 } = {}) => {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      const articles = await Article.find({ 
        status: 'published',
        updatedAt: { $gte: dateThreshold }
      })
        .sort({ lastUpdatedAt: -1 })
        .limit(limit)
        .populate('author', 'name')
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


module.exports = getRecentUpdates;