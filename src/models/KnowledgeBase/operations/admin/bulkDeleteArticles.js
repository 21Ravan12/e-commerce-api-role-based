const bulkDeleteArticles = async (Article, articleIds, adminId, reason) => {
  if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
    throw new Error('Invalid article IDs provided');
  }

  // Soft delete articles by setting status to 'archived'
  const result = await Article.updateMany(
    { _id: { $in: articleIds } },
    { $set: { status: 'archived', deletedAt: new Date() } }
  );

  return { success: true, deletedCount: result.modifiedCount || result.nModified };
};

module.exports = bulkDeleteArticles;