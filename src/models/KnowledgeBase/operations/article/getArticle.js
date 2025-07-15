const mongoose = require('mongoose');
const getArticle = async (Article, articleIdOrSlug, incrementView = false) => {
    try {
      const query = mongoose.Types.ObjectId.isValid(articleIdOrSlug) 
        ? { _id: articleIdOrSlug }
        : { slug: articleIdOrSlug };

      const article = await Article.findOne(query)
        .populate('author', 'name email')
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug');

      if (!article) {
        return {
          success: false,
          error: 'Article not found'
        };
      }

      // Increment view count if requested
      if (incrementView) {
        article.viewCount += 1;
        await article.save();
      }

      return {
        success: true,
        data: article
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = getArticle;