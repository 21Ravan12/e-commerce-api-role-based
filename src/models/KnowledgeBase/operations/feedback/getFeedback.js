const getFeedback = async (Feedback, { 
    articleId = null,
    userId = null,
    status = 'pending',
    page = 1,
    limit = 10
  } = {}) => {
    try {
      const skip = (page - 1) * limit;
      
      const query = { status };
      if (articleId) query.article = articleId;
      if (userId) query.user = userId;

      const [feedback, total] = await Promise.all([
        Feedback.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('user', 'name email')
          .lean(),
        Feedback.countDocuments(query)
      ]);

      return {
        success: true,
        data: feedback,
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

module.exports = getFeedback;