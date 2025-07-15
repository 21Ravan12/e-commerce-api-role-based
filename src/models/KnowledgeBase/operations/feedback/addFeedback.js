const addFeedback = async (Article, Feedback, articleId, feedbackData, userId) => {
    try {
      // Check if article exists
      const article = await Article.findById(articleId);
      if (!article) {
        return {
          success: false,
          error: 'Article not found'
        };
      }

      // Check if user already provided feedback for this article
      const existingFeedback = await Feedback.findOne({
        article: articleId,
        user: userId
      });

      if (existingFeedback) {
        return {
          success: false,
          error: 'You have already provided feedback for this article'
        };
      }

      // Create new feedback
      const feedback = new Feedback({
        article: articleId,
        user: userId,
        ...feedbackData
      });

      await feedback.save();

      return {
        success: true,
        data: feedback,
        message: 'Feedback added successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = addFeedback;