const createArticle = async (Article, articleData, userId) => {
    try {
      // Generate slug if not provided
      if (!articleData.slug) {
        articleData.slug = articleData.title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      // Set author and publishedAt if published
      articleData.author = userId;
      if (articleData.status === 'published') {
        articleData.publishedAt = new Date();
      }

      const article = new Article(articleData);
      await article.save();

      return {
        success: true,
        data: article,
        message: 'Article created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = createArticle;