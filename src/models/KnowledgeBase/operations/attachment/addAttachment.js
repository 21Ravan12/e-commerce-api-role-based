const fs = require('fs');
const path = require('path');

const addAttachment = async (Article, articleId, fileData, user) => {
  let filePath;
  
  try {
    // Validate input
    if (!fileData || !fileData.path || fileData.size === 0) {
      throw new Error('No valid file uploaded');
    }

    const article = await Article.findById(articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    // Optional authorization check
    if (user && user.role === 'author' && String(article.author) !== String(user._id)) {
      throw new Error('Not authorized to update this article');
    }

    // Configure upload directory
    const uploadDir = path.join(__dirname, '../../../../../uploads/knowledgeBase/articles', articleId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process file
    const ext = path.extname(fileData.originalname);
    const filename = `attachment-${Date.now()}${ext}`;
    filePath = path.join(uploadDir, filename);

    fs.renameSync(fileData.path, filePath);
    if (fs.statSync(filePath).size === 0) {
      throw new Error('Uploaded file is empty');
    }

    const storedFileData = {
      url: `/uploads/articles/${articleId}/${filename}`,
      filename,
      path: filePath,
      mimetype: fileData.mimetype,
      size: fileData.size,
      uploadedBy: user?._id,
      createdAt: new Date()
    };

    article.attachments.push(storedFileData);
    await article.save();

    return {
      success: true,
      data: {
        attachment: storedFileData,
        articleId: article._id,
        attachmentsCount: article.attachments.length
      },
      message: 'Attachment added successfully'
    };

  } catch (error) {
    // Clean up if file was partially processed
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

module.exports = addAttachment;