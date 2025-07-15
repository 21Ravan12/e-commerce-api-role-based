const updateArticle = async (Article, articleId, updateData, userId) => {
  try {
    const article = await Article.findById(articleId);

    if (!article) {
      return {
        success: false,
        error: 'Article not found'
      };
    }

    // Check if any updatable field is changed
    let shouldSavePrevious = false;
    for (const key of Object.keys(updateData)) {
      if (
        key !== '_id' &&
        key !== '__v' &&
        key !== 'previousVersions' &&
        article[key] !== updateData[key]
      ) {
        shouldSavePrevious = true;
        break;
      }
    }

    // Save current version before updating
    if (shouldSavePrevious) {
      article.previousVersions.push({
        version: article.version,
        content: article.content,
        updatedAt: article.lastUpdatedAt,
        updatedBy: article.lastUpdatedBy
      });
      article.version += 1;
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== '__v' && key !== 'previousVersions') {
        article[key] = updateData[key];
      }
    });

    // Update metadata
    article.lastUpdatedAt = new Date();
    article.lastUpdatedBy = userId;

    // Set publishedAt if status changed to published
    if (updateData.status === 'published' && article.status !== 'published') {
      article.publishedAt = new Date();
    }

    await article.save();

    return {
      success: true,
      data: article,
      message: 'Article updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = updateArticle;