const bulkUpdateArticles = async (Article, filter, updates) => {
  if (!filter || typeof filter !== 'object') {
    throw new Error('Invalid filter provided');
  }

  if (!updates || typeof updates !== 'object') {
    throw new Error('Invalid updates provided');
  }

  // Get articles before update for logging
  const articlesBefore = await Article.find(filter).lean();

  // Perform bulk update
  const result = await Article.updateMany(
    filter,
    { $set: { ...updates, lastUpdatedAt: new Date() } }
  );

  return { success: true, updatedCount: result.modifiedCount || result.nModified };
};

module.exports = bulkUpdateArticles;