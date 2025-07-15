const purgeOldVersions = async (Article, adminId, options = {}) => {
  const {
    keepLast = 5, // Keep last 5 versions by default
    olderThanDays = 30, // Purge versions older than 30 days
    dryRun = false // Set to true to just get stats without actual deletion
  } = options;

  // Find all articles with previous versions
  const articles = await Article.find({
    'previousVersions.0': { $exists: true }
  });

  let totalPurged = 0;
  const operations = [];

  for (const article of articles) {
    const versionsToKeep = article.previousVersions
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, keepLast);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const versionsToPurge = article.previousVersions.filter(version => {
      return !versionsToKeep.includes(version) && version.updatedAt < cutoffDate;
    });

    if (versionsToPurge.length > 0) {
      totalPurged += versionsToPurge.length;

      if (!dryRun) {
        operations.push({
          updateOne: {
            filter: { _id: article._id },
            update: {
              $pull: {
                previousVersions: {
                  version: { $in: versionsToPurge.map(v => v.version) }
                }
              }
            }
          }
        });
      }
    }
  }

  if (!dryRun && operations.length > 0) {
    await Article.bulkWrite(operations);
  }

  return { success: true, totalPurged, dryRun };
};

module.exports = purgeOldVersions;