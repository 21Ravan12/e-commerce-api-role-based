const addRating = async (Article, Rating, articleId, ratingValue, userId) => {
    try {
      // Check if article exists
      const article = await Article.findById(articleId);
      if (!article) {
        return {
          success: false,
          error: 'Article not found'
        };
      }

      // Check if user already rated this article
      const existingRating = await Rating.findOne({
        article: articleId,
        user: userId
      });

      if (existingRating) {
        return {
          success: false,
          error: 'You have already rated this article'
        };
      }

      // Create new rating
      const rating = new Rating({
        article: articleId,
        user: userId,
        rating: ratingValue
      });

      await rating.save();

      return {
        success: true,
        data: rating,
        message: 'Rating added successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = addRating;