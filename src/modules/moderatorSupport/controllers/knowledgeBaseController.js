const RedisClient = require('../../../lib/redis');
const logger = require('../../../services/logger');
const mongoose = require('mongoose');
const AuditLog = require('../../../models/AuditLog/index');
const {
  Article,
  Category,
  Feedback,
  Rating,
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  addAttachment,
  deleteAttachment,
  updateFeedback,
  updateRating,
  restoreVersion,
} = require('../../../models/knowledgeBase');

class KnowledgeBaseModeratorController {
  constructor() {
    this.redis = RedisClient;
    this.createArticle = this.createArticle.bind(this);
    this.getArticle = this.getArticle.bind(this);
    this.updateArticle = this.updateArticle.bind(this);
    this.deleteArticle = this.deleteArticle.bind(this);
    this.createCategory = this.createCategory.bind(this);
    this.getCategory = this.getCategory.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.addAttachment = this.addAttachment.bind(this);
    this.deleteAttachment = this.deleteAttachment.bind(this);
    this.updateFeedback = this.updateFeedback.bind(this);
    this.updateRating = this.updateRating.bind(this);
    this.restoreVersion = this.restoreVersion.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  async createArticle(req, res) {
    try {
      logger.info(`Create article request from IP: ${req.ip}`);

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      const articleData = req.body;
      const result = await createArticle(
        {
          ...articleData,
          lastModifiedBy: req.user._id
        },
        req.user._id
      );

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_create_article',
        event: 'create_article',
        source: 'moderator',
        targetModel: 'Article',
        targetId: result._id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          title: result.title,
          status: result.status
        }
      });

      res.status(201).json({
        message: result.success == true ? 'Article created successfully' : 'Article creation failed: '+ result.error,
        articleId: result._id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getArticle(req, res) {
    try {
      logger.info(`Get article request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid article ID');
      }

      const article = await getArticle(req.params.id);

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_get_article',
        event: 'get_article',
        source: 'moderator',
        targetModel: 'Article',
        targetId: req.params.id,
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        data: article,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateArticle(req, res) {
    try {
      logger.info(`Update article request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid article ID');
      }

      const updateData = req.body;
      const result = await updateArticle(
        req.params.id,
        {
          ...updateData,
          lastModifiedBy: req.user._id
        },
        req.user._id
      );

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_update_article',
        event: 'update_article',
        source: 'moderator',
        targetModel: 'Article',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          updatedFields: Object.keys(updateData)
        }
      });

      res.status(200).json({
        message: result.success == true ? 'Article updated successfully' : 'Article update failed: '+ result.error,
        articleId: result._id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteArticle(req, res) {
    try {
      logger.info(`Delete article request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid article ID');
      }

      const { reason } = req.body;
      const result = await deleteArticle(
        req.params.id,
        req.user._id,
        reason || 'Deleted by moderator'
      );

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_delete_article',
        event: 'delete_article',
        source: 'moderator',
        targetModel: 'Article',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          reason: reason,
          title: result.title
        }
      });

      res.status(200).json({
        message: result.success == true ? 'Article deleted successfully' : 'Article deletion failed: '+ result.error,
        articleId: result._id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }


  async createCategory(req, res) {
    try {
      logger.info(`Create category request from IP: ${req.ip}`);

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      const categoryData = req.body;
      const result = await createCategory(
        {
          ...categoryData,
          createdBy: req.user._id
        }
      );

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_create_category',
        event: 'create_category',
        source: 'moderator',
        targetModel: 'Category',
        targetId: result._id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          name: result.name
        }
      });

      res.status(201).json({
        message: result.success == true ? 'Category created successfully' : 'Category creation failed: '+ result.error,
        categoryId: result._id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getCategory(req, res) {
    try {
      logger.info(`Get category request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid category ID');
      }

      const category = await getCategory(req.params.id);

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_get_category',
        event: 'get_category',
        source: 'moderator',
        targetModel: 'Category',
        targetId: req.params.id,
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        data: category,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateCategory(req, res) {
    try {
      logger.info(`Update category request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid category ID');
      }

      const updateData = req.body;
      const result = await updateCategory(
        req.params.id,
        updateData,
        req.user._id
      );

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_update_category',
        event: 'update_category',
        source: 'moderator',
        targetModel: 'Category',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          updatedFields: Object.keys(updateData)
        }
      });

      res.status(200).json({
        message: result.success == true ? 'Category updated successfully' : 'Category update failed: '+ result.error,
        categoryId: result._id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteCategory(req, res) {
    try {
      logger.info(`Delete category request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid category ID');
      }

      const { reason } = req.body;
      const result = await deleteCategory(
        req.params.id,
        req.user._id,
        reason || 'Deleted by moderator'
      );

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_delete_category',
        event: 'delete_category',
        source: 'moderator',        
        targetModel: 'Category',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          reason: reason,
          name: result.name
        }
      });

      res.status(200).json({
        message: result.success == true ? 'Category deleted successfully' : 'Category deletion failed: '+ result.error,
        categoryId: result._id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }


  async addAttachment(req, res) {
  try {
    logger.info(`Add attachment request for article ID: ${req.params.id} from IP: ${req.ip}`);

    // Validate article ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new Error('Invalid article ID');
    }

    // Validate files - check both req.file and req.files
    const files = req.files;

    // Process each file
    const results = await Promise.all(files.map(async (file) => {
      if (!file) {
        throw new Error('Invalid file object');
      }

      const attachmentData = {
        originalname: file.originalname || file.name, // Handle different file object structures
        mimetype: file.mimetype,
        size: file.size,
        path: file.path || file.tempFilePath,
        description: req.body.description
      };

      const result = await addAttachment(
        req.params.id,
        attachmentData,
        req.user
      );

      // Log each attachment
      await AuditLog.createLog({
        action: 'knowledge_base_add_attachment',
        event: 'add_attachment',
        source: req.user.role,        
        targetModel: 'Article',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          fileName: attachmentData.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          attachmentId: result.data?.attachment?._id
        }
      });

      return result;
    }));

    // Check for any failures
    const failedUploads = results.filter(r => !r.success);
    if (failedUploads.length > 0) {
      const errorMessages = failedUploads.map(f => f.error).join('; ');
      throw new Error(`Some attachments failed to upload: ${errorMessages}`);
    }

    res.status(201).json({
      success: true,
      message: `${results.length} attachment(s) added successfully`,
      attachments: results.map(r => ({
        id: r.data.attachment._id,
        url: r.data.attachment.url,
        description: req.body.description,
        size: r.data.attachment.size,
        type: r.data.attachment.mimetype
      })),
      articleId: req.params.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Attachment upload failed: ${error.message}`, {
      articleId: req.params.id,
      userId: req.user?._id,
      error: error.stack
    });
    this.handleError(res, error);
  }
  }
 
  async deleteAttachment(req, res) {
    try {
      logger.info(`Delete attachment request for ID: ${req.params.attachmentId} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.attachmentId)) {
        throw new Error('Invalid attachment ID');
      }

      const { reason } = req.body;
      const result = await deleteAttachment(
        req.params.articleId,
        req.params.attachmentId,
        req.user._id,
      );

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_delete_attachment',
        event: 'delete_attachment',
        source: 'moderator',      
        targetModel: 'Attachment',
        targetId: req.params.attachmentId,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          reason: reason,
          fileName: result.fileName
        }
      });

      res.status(200).json({
        message: 'Attachment deleted successfully',
        attachmentId: result._id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  
  async updateFeedback(req, res) {
    try {
      logger.info(`Update feedback request for ID: ${req.params.feedbackId} from IP: ${req.ip}`);

      if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
        throw new Error('Not authorized', 403);
      }

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.feedbackId)) {
        throw new Error('Invalid feedback ID');
      }

      const updateData = req.body;
      const result = await updateFeedback(
        Feedback,
        req.params.feedbackId,
        updateData,
        req.user._id
      );

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_update_feedback',
        event: 'delete_attachment',
        source: 'moderator',     
        targetModel: 'Feedback',
        targetId: req.params.feedbackId,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          updatedFields: Object.keys(updateData)
        }
      });

      res.status(200).json({
        message: 'Feedback updated successfully',
        feedbackId: result._id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateRating(req, res) {
    try {
      logger.info(`Update rating request for ID: ${req.params.ratingId} from IP: ${req.ip}`);

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.ratingId)) {
        throw new Error('Invalid rating ID');
      }

      const { value } = req.body;
      if (value < 1 || value > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const result = await updateRating(
        Rating,
        req.params.ratingId,
        { value },
        req.user._id
      );

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_update_rating',
        targetModel: 'Rating',
        event: 'update_rating',
        source: 'moderator',     
        targetId: req.params.ratingId,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          newValue: value
        }
      });

      res.status(200).json({
        message: 'Rating updated successfully',
        ratingId: result._id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async restoreVersion(req, res) {
    try {
      logger.info(`Restore version request for article ID: ${req.params.id}, version: ${req.params.version} from IP: ${req.ip}`);

      if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
        throw new Error('Not authorized', 403);
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid article ID');
      }

      const { reason } = req.body;
      const result = await restoreVersion(
        req.params.id,
        req.params.version,
        req.user._id,
        reason || 'Version restored by moderator'
      );

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_restore_version',
        targetModel: 'Article',
        event: 'restore_version',
        source: 'moderator',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          version: req.params.version,
          reason: reason,
          newVersion: result.newVersion
        }
      });

      res.status(200).json({
        message: 'Version restored successfully',
        articleId: result.articleId,
        restoredVersion: req.params.version,
        currentVersion: result.newVersion,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  handleError(res, error) {
    logger.error(`KnowledgeBase moderator error: ${error.message}`, { stack: error.stack });
    
    const statusCode = error.message.includes('Content-Type') ? 415 :
                     error.message.includes('Validation error') ? 400 :
                     error.message.includes('Not authorized') ? 403 :
                     error.message.includes('not found') ? 404 :
                     error.message.includes('already exists') ? 409 :
                     error.message.includes('invalid') ? 400 : 500;
    
    res.status(statusCode).json({ 
      error: error.message,
      ...(statusCode === 400 && { details: error.details })
    });
  }
}

module.exports = new KnowledgeBaseModeratorController();