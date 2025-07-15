const getVersion = async (Article, articleId, versionNumber) => {
  try {
    const article = await Article.findById(articleId).select('previousVersions version content');
    if (!article) {
      return { success: false, error: 'Article not found' };
    }
    if (article.version === versionNumber) {
      // Current version
      return { success: true, data: { version: article.version, content: article.content } };
    }
    const version = article.previousVersions.find(v => v.version === versionNumber);
    if (!version) {
      return { success: false, error: 'Version not found' };
    }
    return { success: true, data: version };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = getVersion;