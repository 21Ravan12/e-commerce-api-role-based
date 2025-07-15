const RedisClient = require('../../../lib/redis');
const logger = require('../../../services/logger');
const mongoose = require('mongoose');
const AuditLog = require('../../../models/AuditLog/index');
const {
  listArticles,
  searchArticles,
  listCategories,
  getAttachments,
  getFeedback,
  addFeedback,
  addRating,
  getAverageRating,
  getArticleHistory,
  getVersion,
  getFeaturedArticles,
  getFrequentlyViewed,
  getMostHelpful,
  getPopularArticles,
  getRecentUpdates
} = require('../../../models/knowledgeBase');

class KnowledgeBaseController {
  constructor() {
    this.redis = RedisClient;
    this.handleError = this.handleError.bind(this);
    this.listArticles = this.listArticles.bind(this);
    this.searchArticles = this.searchArticles.bind(this);
    this.listCategories = this.listCategories.bind(this);
    this.getAttachments = this.getAttachments.bind(this);
    this.getFeedback = this.getFeedback.bind(this);
    this.addFeedback = this.addFeedback.bind(this);
    this.addRating = this.addRating.bind(this);
    this.getAverageRating = this.getAverageRating.bind(this);
    this.getArticleHistory = this.getArticleHistory.bind(this);
    this.getVersion = this.getVersion.bind(this); 
    this.getFeaturedArticles = this.getFeaturedArticles.bind(this);
    this.getFrequentlyViewed = this.getFrequentlyViewed.bind(this);
    this.getMostHelpful = this.getMostHelpful.bind(this);
    this.getPopularArticles = this.getPopularArticles.bind(this);
    this.getRecentUpdates = this.getRecentUpdates.bind(this);
  }

  async listArticles(req, res) {
    try {
      logger.info(`List articles request from IP: ${req.ip}`);

      const { page = 1, limit = 10, status = 'draft', sort = 'createdAt', order = 'desc', category } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sort]: order === 'desc' ? -1 : 1 },
        status,
        category,
      };

      const articles = await listArticles(options);

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_list_articles',
        event: 'list_articles',
        source: 'web',        
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          page,
          limit,
          category
        }
      });

      res.status(200).json({
        data: articles,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: articles.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async searchArticles(req, res) {
    try {
      logger.info(`Search articles request from IP: ${req.ip}`);

      const { q: query, page = 1, limit = 10, category } = req.query;

      if (!query || query.trim().length < 3) {
        throw new Error('Search query must be at least 3 characters long');
      }

      const results = await searchArticles({
        query: query.trim(),
        page: parseInt(page),
        limit: parseInt(limit),
        category: category ? category.trim() : null
      });

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_search',
        event: 'search_articles',
        source: 'web',        
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          query,
          resultsCount: results.length
        }
      });

      res.status(200).json({
        query,
        results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: results.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async listCategories(req, res) {
    try {
      logger.info(`List categories request from IP: ${req.ip}`);

      const { includeCount = false } = req.query;

      const categories = await listCategories(includeCount);

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_list_categories',
        event: 'list_categories',
        source: 'web',        
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        data: categories,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }


  async getAttachments(req, res) {
    try {
      logger.info(`Get attachments request for article ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid article ID');
      }

      const attachments = await getAttachments(req.params.id);

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_get_attachments',
        event: 'get_attachments',
        source: 'web',        
        targetId: req.params.id,
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          attachmentsCount: attachments.length
        }
      });

      res.status(200).json({
        articleId: req.params.id,
        attachments,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }


  async getFeedback(req, res) {
    try {
      logger.info(`Get feedback request for article ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid article ID');
      }

      const feedback = await getFeedback(req.params.id);

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_get_feedback',
        event: 'get_feedback',
        source: 'web',        
        targetId: req.params.id,
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          feedbackCount: feedback.length
        }
      });

      res.status(200).json({
        articleId: req.params.id,
        feedback,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async addFeedback(req, res) {
    try {
      logger.info(`Add feedback request for article ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid article ID');
      }

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      const { comment, isHelpful } = req.body;

      const feedback = await addFeedback(
        req.params.id,
        {
          comment,
          isHelpful,
          ip: req.ip
        },
        req.user?._id
      );

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_add_feedback',
        event: 'add_feedback',
        source: 'web',        
        targetId: req.params.id,
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        message: feedback.success == true ? 'Feedback added successfully' : 'Feedback creation failed: '+ feedback.error,
        feedbackId: feedback._id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }


  async addRating(req, res) {
    try {
      logger.info(`Add rating request for article ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid article ID');
      }

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      const { value } = req.body;

      if (value < 1 || value > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const rating = await addRating(
        req.params.id,
        value,
        req.user?._id
      );

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_add_rating',
        event: 'add_rating',
        source: 'web',        
        targetId: req.params.id,
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          ratingValue: value
        }
      });

      res.status(201).json({
        message: rating.success == true ? 'Rating added successfully' : 'Rating creation failed: '+ rating.error,
        ratingId: rating._id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getAverageRating(req, res) {
    try {
      logger.info(`Get average rating request for article ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid article ID');
      }

      const rating = await getAverageRating(req.params.id);

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_get_rating',
        event: 'get_rating',
        source: 'web',
        targetId: req.params.id,
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        message: rating.success == true ? 'Feedback feched successfully' : 'Feedback feching failed: '+ rating.error,
        averageRating: rating.data,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }


  async getArticleHistory(req, res) {
    try {
      logger.info(`Get article history request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid article ID');
      }

      const history = await getArticleHistory(req.params.id);

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_get_history',
        targetId: req.params.id,
        event: 'get_history',
        source: 'web',
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          versionsCount: history.length
        }
      });

      res.status(200).json({
        articleId: req.params.id,
        history,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getVersion(req, res) {
    try {
      logger.info(`Get version request for article ID: ${req.params.id}, version: ${req.params.version} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid article ID');
      }

      const version = await getVersion(req.params.id, Number(req.params.version));

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_get_version',
        targetId: req.params.id,
        event: 'get_version',
        source: 'web',
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          version: req.params.version
        }
      });

      res.status(200).json({
        articleId: req.params.id,
        version: req.params.version,
        data: version,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getFeaturedArticles(req, res) {
    try {
      logger.info(`Get featured articles request from IP: ${req.ip}`);

      const { limit = 5 } = req.query;

      const articles = await getFeaturedArticles(parseInt(limit));

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_get_featured',
        performedBy: req.user?._id,
        event: 'get_featured',
        source: 'web',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          limit
        }
      });

      res.status(200).json({
        data: articles,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getFrequentlyViewed(req, res) {
    try {
      logger.info(`Get frequently viewed articles request from IP: ${req.ip}`);

      const { limit = 5, days = 30 } = req.query;

      const articles = await getFrequentlyViewed(parseInt(limit), parseInt(days));

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_get_frequent',
        performedBy: req.user?._id,
        event: 'get_frequent',
        source: 'web',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          limit,
          days
        }
      });

      res.status(200).json({
        data: articles,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getMostHelpful(req, res) {
    try {
      logger.info(`Get most helpful articles request from IP: ${req.ip}`);

      const { limit = 5, days = 10 } = req.query;

      const articles = await getMostHelpful(parseInt(limit), parseInt(days));

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_get_helpful',
        performedBy: req.user?._id,
        event: 'get_helpful',
        source: 'web',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          limit
        }
      });

      res.status(200).json({
        data: articles,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getPopularArticles(req, res) {
    try {
      logger.info(`Get popular articles request from IP: ${req.ip}`);

      const { limit = 5 } = req.query;

      const articles = await getPopularArticles(parseInt(limit));

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_get_popular',
        event: 'get_popular',
        source: 'web',
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          limit
        }
      });

      res.status(200).json({
        data: articles,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getRecentUpdates(req, res) {
    try {
      logger.info(`Get recent updates request from IP: ${req.ip}`);

      const { limit = 5, days = 15 } = req.query;

      const updates = await getRecentUpdates(parseInt(limit), parseInt(days));

      // Log the action
      await AuditLog.createLog({
        action: 'knowledge_base_get_updates',
        performedBy: req.user?._id,
        event: 'get_updates',
        source: 'web',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          limit
        }
      });

      res.status(200).json({
        data: updates,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  handleError(res, error) {
    logger.error(`KnowledgeBase admin error: ${error.message}`, { stack: error.stack });
    
    const statusCode = error.message.includes('Content-Type') ? 415 :
                     error.message.includes('Validation error') ? 400 :
                     error.message.includes('not found') ? 404 :
                     error.message.includes('already exists') ? 409 :
                     error.message.includes('invalid') ? 400 : 500;
    
    res.status(statusCode).json({ 
      error: error.message,
      ...(statusCode === 400 && { details: error.details })
    });
  }
}

module.exports = new KnowledgeBaseController();