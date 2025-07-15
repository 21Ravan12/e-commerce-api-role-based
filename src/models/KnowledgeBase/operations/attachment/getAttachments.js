const getAttachments = async (Article, articleId, user) => {
  try {
    // Validate input
    if (!articleId) {
      throw new Error('Article ID is required');
    }

    const article = await Article.findById(articleId)
      .select('attachments title author');
    
    if (!article) {
      throw new Error('Article not found');
    }

    // Optional authorization check (if you need it)
    if (user && user.role === 'author' && String(article.author) !== String(user._id)) {
      throw new Error('Not authorized to view attachments for this article');
    }

    // Transform attachments to include proper URLs if needed
    const attachments = article.attachments.map(attachment => ({
      ...attachment.toObject(),
      // If you store relative paths, construct full URL:
      // url: `${process.env.BASE_URL || ''}${attachment.url}`,
      // Or if you need to convert path to URL:
      // url: attachment.path.replace(/^.*[\\\/]uploads[\\\/]/, '/uploads/')
    }));

    return {
      success: true,
      data: attachments,
      count: attachments.length,
      articleTitle: article.title // Optional: include article info
    };

  } catch (error) {
    console.error(`Error getting attachments for article ${articleId}:`, error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code // Optional: include error code if available
    };
  }
};

module.exports = getAttachments;