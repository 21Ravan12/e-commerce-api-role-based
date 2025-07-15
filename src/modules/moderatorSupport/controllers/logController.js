const RedisClient = require('../../../lib/redis');
const logger = require('../../../services/logger');
const mongoose = require('mongoose');
const AuditLog = require('../../../models/AuditLog/index');

class logController {
  constructor() {
    this.redis = RedisClient;
    this.handleError = this.handleError.bind(this);
    this.searchAuditLogs = this.searchAuditLogs.bind(this);
    this.searchAdminLogs = this.searchAdminLogs.bind(this);
    this.getAuditLogByCorrelationId = this.getAuditLogByCorrelationId.bind(this);
    this.getAdminLogByCorrelationId = this.getAdminLogByCorrelationId.bind(this);
    this.getLogsByUser = this.getLogsByUser.bind(this);
  }

  async searchAuditLogs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null
    const query = req.query || {};
    const skip = (page - 1) * limit;

    const cacheKey = `auditLogs:${JSON.stringify(query)}:${page}:${limit}`;
    logger.info(`Search audit logs from IP: ${req.ip}, Page: ${page}, Limit: ${limit}`);

    // Try cache
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      logger.info('Audit logs served from cache');
      return res.status(200).json({
        data: JSON.parse(cachedData),
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const logs = await AuditLog.getLogs({
      ...query,
        page,
        limit,
        startDate,
        endDate,
        skip,
        sortBy: '-timestamp'
    });

    if (!logs || logs.length === 0) {
        logger.warn('No audit logs found for the given query');
        return res.status(404).json({
            message: 'No audit logs found for the given query',
            timestamp: new Date().toISOString()
        });
    }

    const result = {
      data: logs,
      meta: {
        page,
        limit,
      }
    };

    // Cache result for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    // Optional: Log the action
    await AuditLog.createLog({
      action: 'audit_log_search',
      event: 'search_audit_logs',
      source: 'moderator',
      targetModel: 'AuditLog',
      performedBy: req.user?._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      query: req.query
    });

    res.status(200).json({
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to search audit logs', { error });
    this.handleError(res, error);
  }
  }

  async searchAdminLogs(req, res) {
  try {
    logger.info(`Search admin logs requested from IP: ${req.ip}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const query = req.query || {};
    const skip = (page - 1) * limit;
    const cacheKey = `adminLogs:${JSON.stringify(query)}:${page}:${limit}`;

    // Try to get from cache
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: JSON.parse(cachedData),
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const logs = await AuditLog.getAdminLogs({
      ...query,
        page,
        limit,
        skip,
        sortBy: '-createdAt'
    });

    if (!logs || logs.length === 0) {
      logger.warn('No admin logs found for the given query');
        return res.status(404).json({
            message: 'No admin logs found for the given query',
            timestamp: new Date().toISOString()
        });
    }
    const total = logs.length; // Assuming logs is an array of results

    const result = {
      data: logs,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };

    // Cache the result for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    // Log the action
    await AuditLog.createLog({
      action: 'admin_logs_search',
      event: 'search_logs',
      source: 'admin_panel',
      targetModel: 'AdminLog',
      performedBy: req.user?._id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to search admin logs', { error });
    this.handleError(res, error);
  }
  }

  async getAuditLogByCorrelationId(req, res) {
  try {
    const correlationId = req.params.correlationId;

    logger.info(`Get audit log request for correlation ID: ${correlationId} from IP: ${req.ip}`);

    if (!correlationId || typeof correlationId !== 'string') {
      throw new Error('Invalid or missing correlation ID');
    }

    const auditLog = await AuditLog.getLogById(correlationId);

    // Log the action
    await AuditLog.createLog({
      action: 'get_audit_log',
      event: 'fetch_by_correlation_id',
      source: 'system',
      targetModel: 'AuditLog',
      targetId: auditLog?._id,
      metadata: { correlationId },
      performedBy: req.user?._id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      data: auditLog,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get audit log by correlation ID', { correlationId: req?.params?.correlationId, error });
    this.handleError(res, error);
  }
  }

  async getAdminLogByCorrelationId(req, res) {
    try {
      const correlationId = req.params.correlationId;
      logger.info(`Get admin log request for correlation ID: ${correlationId} from IP: ${req.ip}`);

      if (!correlationId || typeof correlationId !== 'string') {
        throw new Error('Invalid correlation ID');
      }

      // Pass correlationId directly, not as an object
      const log = await AuditLog.getAdminLogById(correlationId);

      // Log the action
      await AuditLog.createLog({
        action: 'get_admin_log_by_correlation_id',
        event: 'get_admin_log',
        source: 'admin_panel',
        targetModel: 'AdminLog',
        targetId: log?._id,
        performedBy: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        data: log,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to get admin log by correlation ID', {
        correlationId: req.params.correlationId,
        error
      });
      this.handleError(res, error);
    }
  }

  async getLogsByUser(req, res) {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    logger.info(`Get logs request for user ID: ${userId} from IP: ${req.ip}`);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const cacheKey = `userLogs:${userId}:${page}:${limit}`;
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const { auditLogs, adminLogs, totalAudit, totalAdmin } = await AuditLog.getLogsByUserId({
      userId,
      page,
      limit,
      skip,
      sortBy: '-timestamp'
    });

    console.log(1);

    const combinedLogs = [...auditLogs, ...adminLogs]
      .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
      .slice(0, limit);

    const result = {
      data: combinedLogs,
      meta: {
        total: totalAudit + totalAdmin,
        page,
        limit,
        pages: Math.ceil((totalAudit + totalAdmin) / limit),
        auditTotal: totalAudit,
        adminTotal: totalAdmin
      },
      timestamp: new Date().toISOString()
    };

    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    await AuditLog.createLog({
      action: 'get_user_logs',
      event: 'fetch_logs',
      source: 'moderator',
      targetModel: 'User',
      targetId: userId,
      performedBy: req.user?._id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json(result);

  } catch (error) {
    this.handleError(res, error);
  }
  }

  _buildAuditLogFilter(query) {
    const filter = {};
    
    if (query.event) {
      filter.event = { $regex: query.event, $options: 'i' };
    }
    
    if (query.userEmail) {
      filter.userEmail = query.userEmail.toLowerCase();
    }
    
    if (query.status) {
      filter.status = query.status;
    }
    
    if (query.source) {
      filter.source = query.source.toLowerCase();
    }
    
    if (query.action) {
      filter.action = query.action.toLowerCase();
    }
    
    if (query.entityType) {
      filter.entityType = query.entityType;
    }
    
    if (query.entityId) {
      filter.entityId = mongoose.Types.ObjectId(query.entityId);
    }
    
    if (query.startDate && query.endDate) {
      filter.timestamp = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate)
      };
    } else if (query.startDate) {
      filter.timestamp = { $gte: new Date(query.startDate) };
    } else if (query.endDate) {
      filter.timestamp = { $lte: new Date(query.endDate) };
    }
    
    if (query.searchText) {
      filter.$text = { $search: query.searchText };
    }
    
    return filter;
  }

  _buildAdminLogFilter(query) {
    const filter = {};
    
    if (query.action) {
      filter.action = query.action.toLowerCase();
    }
    
    if (query.targetModel) {
      filter.targetModel = query.targetModel;
    }
    
    if (query.targetId) {
      filter.targetId = mongoose.Types.ObjectId(query.targetId);
    }
    
    if (query.performedByEmail) {
      filter.performedByEmail = query.performedByEmail.toLowerCase();
    }
    
    if (query.status) {
      filter.status = query.status;
    }
    
    if (query.source) {
      filter.source = query.source.toLowerCase();
    }
    
    if (query.startDate && query.endDate) {
      filter.createdAt = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate)
      };
    } else if (query.startDate) {
      filter.createdAt = { $gte: new Date(query.startDate) };
    } else if (query.endDate) {
      filter.createdAt = { $lte: new Date(query.endDate) };
    }
    
    if (query.searchText) {
      filter.$text = { $search: query.searchText };
    }
    
    return filter;
  }

  handleError(res, error) {
    logger.error(`Log moderator error: ${error.message}`, { stack: error.stack });
    
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

module.exports = new logController();