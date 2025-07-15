const deleteArticle = async (Article, articleId) => {
    try {
      const article = await Article.findByIdAndDelete(articleId);
      
      if (!article) {
        return {
          success: false,
          error: 'Article not found'
        };
      }

      return {
        success: true,
        message: 'Article deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = deleteArticle;