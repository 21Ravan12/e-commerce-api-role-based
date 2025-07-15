const fs = require('fs');
const path = require('path');

const deleteAttachment = async (Article, articleId, attachmentId, user) => {
  try {
    // Validate input
    if (!articleId || !attachmentId) {
      throw new Error('Missing article ID or attachment ID');
    }

    const article = await Article.findById(articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    // Find attachment
    const attachment = article.attachments.id(attachmentId);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // Delete file from filesystem
    if (attachment.path) {
      // Use the stored path directly (since addAttachment stores absolute path)
      const filePath = attachment.path;
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Optional: Remove empty directory
      const dirPath = path.dirname(filePath);
      if (fs.existsSync(dirPath) && fs.readdirSync(dirPath).length === 0) {
        fs.rmdirSync(dirPath);
      }
    }

    // Remove attachment from array
    article.attachments.pull(attachmentId);
    article.lastUpdatedBy = user?._id;
    await article.save();

    return {
      success: true,
      data: {
        articleId: article._id,
        attachmentsCount: article.attachments.length,
        deletedAttachment: attachmentId
      },
      message: 'Attachment deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting attachment:', error);
    throw error;
  }
};

module.exports = deleteAttachment;