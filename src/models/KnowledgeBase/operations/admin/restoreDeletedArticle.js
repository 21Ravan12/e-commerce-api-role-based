const restoreDeletedArticle = async (Article, articleId, adminId, reason) => {
  // Find and restore the article
  const article = await Article.findOneAndUpdate(
    { _id: articleId, status: 'archived' },
    { $set: { status: 'published', deletedAt: null }, $unset: { deletedBy: '' } },
    { new: true }
  );

  if (!article) {
    throw new Error('Article not found or not deleted');
  }

  return { success: true, article };
};

module.exports = restoreDeletedArticle;