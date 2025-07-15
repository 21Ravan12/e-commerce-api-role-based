const getArticleHistory = async (Article, articleId) => {
  try {
    const article = await Article.findById(articleId).select('previousVersions');
    if (!article) {
      return { success: false, error: 'Article not found' };
    }
    return { success: true, data: article.previousVersions };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = getArticleHistory;