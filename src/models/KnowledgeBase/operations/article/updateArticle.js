const updateArticle = async (Article, articleId, updateData, userId) => {
    try {
      const article = await Article.findById(articleId);
      
      if (!article) {
        return {
          success: false,
          error: 'Article not found'
        };
      }

      // Save current version before updating
      article.previousVersions.push({
        version: article.version,
        title: article.title,
        slug: article.slug, 
        excerpt: article.excerpt,
        category: article.category,
        subcategory: article.subcategory,
        tags: article.tags,
        content: article.content,
        updatedAt: article.lastUpdatedAt,
        updatedBy: article.lastUpdatedBy
      });
      article.version += 1;

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== '__v') {
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