const restoreVersion = async (Article, articleId, versionNumber, userId) => {
  try {
    const article = await Article.findById(articleId);
    if (!article) {
      return { success: false, error: 'Article not found' };
    }
    const version = article.previousVersions.find(v => v.version === versionNumber);
    if (!version) {
      return { success: false, error: 'Version not found' };
    }
    // Save current version before restoring
    article.previousVersions.push({
      version: article.version,
      content: article.content,
      updatedAt: article.lastUpdatedAt,
      updatedBy: article.lastUpdatedBy
    });
    article.content = version.content;
    article.version += 1;
    article.lastUpdatedAt = new Date();
    article.lastUpdatedBy = userId;
    await article.save();
    return { success: true, data: article, message: 'Version restored successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = restoreVersion;