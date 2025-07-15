const RedisClient = require('../../../../../lib/redis');
const logger = require('../../../../../services/logger');
const mongoose = require('mongoose');
const AuditLog = require('../../../../../models/AuditLog/index');
const {
  Article,
  Category,
  Feedback,
  Rating,
  AdminLog,
  bulkDeleteArticles,
  bulkUpdateArticles,
  exportAllData,
  purgeOldVersions,
  rebuildSearchIndex,
  restoreDeletedArticle,
  updateSystemSettings
} = require('../../../../../models/knowledgeBase');

class KnowledgeBaseAdminController {
  constructor() {
    this.redis = RedisClient;
  }

  async bulkDeleteArticles(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'bulk_delete_articles',
        targetModel: 'Article',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestContentType: req.get('Content-Type'),
            articleIdsCount: req.body?.articleIds?.length || 0,
            reason: req.body?.reason || 'Not specified'
        }
    });

    try {
        logger.info(`Bulk delete articles request from IP: ${req.ip}`);

        // Content-Type validation
        if (!req.is('application/json')) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid Content-Type',
                    contentType: req.get('Content-Type')
                }
            });
            return res.status(400).json({ success: false, error: 'Content-Type must be application/json' });
        }

        const { articleIds, reason } = req.body;

        // Input validation
        if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid article IDs provided',
                    receivedIds: articleIds ? 'Present but invalid' : 'Missing'
                }
            });
            return res.status(400).json({ success: false, error: 'Invalid article IDs provided' });
        }

        // Validate each article ID format
        const invalidIds = articleIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Some article IDs are invalid',
                    invalidIdsCount: invalidIds.length,
                    exampleInvalidId: invalidIds[0] // Log just one example to avoid huge logs
                }
            });
            return res.status(400).json({ 
                success: false, 
                error: `Contains ${invalidIds.length} invalid IDs`,
                invalidCount: invalidIds.length
            });
        }

        const result = await bulkDeleteArticles(
            articleIds,
            req.user._id,
            reason || 'Bulk deletion by admin'
        );

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                deletedCount: result.deletedCount,
                reason: reason || 'Bulk deletion by admin',
                articleIdsCount: articleIds.length
            }
        });

        res.status(200).json({
            success: true,
            message: 'Articles bulk deleted successfully',
            deletedCount: result.deletedCount,
            requestedCount: articleIds.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                systemError: true
            }
        });

        logger.error(`Bulk delete articles error: ${error.message}`, { error });
        
        // Use consistent error handling
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to bulk delete articles',
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
  }

  async bulkUpdateArticles(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'bulk_update_articles',
        targetModel: 'Article',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            contentType: req.headers['content-type'],
        }
    });

    try {
        logger.info(`Bulk update articles request from IP: ${req.ip}`);

        // Content-Type check
        if (!req.is('application/json')) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid Content-Type',
                    contentType: req.headers['content-type']
                }
            });
            throw new Error('Content-Type must be application/json');
        }

        const { filter, updates, reason } = req.body;

        // Validate required fields
        if (!filter || !updates) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Missing required fields',
                    missingFields: [!filter && 'filter', !updates && 'updates'].filter(Boolean)
                }
            });
            throw new Error('Both filter and updates are required');
        }

        const result = await bulkUpdateArticles(
            filter,
            updates,
            req.user._id,
            reason || 'Bulk update by admin'
        );

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                filter: filter,
                updates: updates,
                updatedCount: result.updatedCount,
                reason: reason,
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        });

        res.status(200).json({
            success: true,
            message: 'Articles bulk updated successfully',
            data: {
                updatedCount: result.updatedCount,
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Complete the admin log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                statusCode: error.statusCode || 500,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        this.handleError(res, error);
    }
  }

  async exportAllData(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'export_all_data',
        targetModel: 'All',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedFormat: req.query.format || 'json',
            exportScope: 'full_database_export'
        }
    });

    try {
        logger.info(`Export all data request from IP: ${req.ip}`);

        const { format = 'json' } = req.query;

        // Perform the data export
        const data = await exportAllData(
            format
        );

        const dataSize = Buffer.byteLength(data, 'utf8');
        
        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                format: format,
                dataSize: dataSize,
                modelsExported: ['Article', 'Category', 'Feedback', 'Rating'],
                estimatedRecordCount: await Promise.all([
                    Article.estimatedDocumentCount(),
                    Category.estimatedDocumentCount(),
                    Feedback.estimatedDocumentCount(),
                    Rating.estimatedDocumentCount()
                ])
            }
        });

        // Set response headers
        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=knowledgebase_export.json');
        } else if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=knowledgebase_export.csv');
        }

        res.status(200).send(data);

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                statusCode: error.statusCode || 500,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        logger.error(`Export all data error: ${error.message}`, { error });
        
        // Handle different error types
        if (error.message === 'Not authorized') {
            res.status(403).json({ 
                success: false, 
                error: 'Not authorized',
                requiredRole: 'admin'
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'Export failed',
                systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
  }

  async purgeOldVersions(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'purge_old_versions',
        targetModel: 'Article',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestBody: req.body
        }
    });

    try {
        logger.info(`Purge old versions request from IP: ${req.ip}`);

        if (!req.is('application/json')) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid Content-Type',
                    contentType: req.get('Content-Type')
                }
            });
            throw new Error('Content-Type must be application/json');
        }

        const { keepLast, olderThanDays, dryRun } = req.body;

        // Validate input parameters
        if (typeof keepLast !== 'number' || keepLast < 0 || 
            typeof olderThanDays !== 'number' || olderThanDays < 0) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid parameters',
                    parameters: { keepLast, olderThanDays }
                }
            });
            return res.status(400).json({ 
                success: false, 
                error: 'Both keepLast and olderThanDays must be positive numbers' 
            });
        }

        const result = await purgeOldVersions(
            req.user._id,
            { keepLast, olderThanDays, dryRun }
        );

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                parameters: {
                    keepLast,
                    olderThanDays,
                    dryRun
                },
                result: {
                    totalPurged: result.totalPurged,
                    totalSkipped: result.totalSkipped,
                    totalExamined: result.totalExamined
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Old versions purged successfully',
            ...result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Complete the admin log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                statusCode: error.statusCode || 500
            }
        });

        // Use your existing error handler
        this.handleError(res, error);
    }
  }

  async rebuildSearchIndex(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'rebuild_search_index',
        targetModel: 'Article',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            initiatedBy: req.user._id,
            userRole: req.user.role
        }
    });

    try {
        logger.info(`Rebuild search index request from IP: ${req.ip}`);

        const result = await rebuildSearchIndex(
            req.user._id
        );

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                rebuildResult: {
                    status: result.status,
                    processedCount: result.processedCount,
                    elapsedTime: result.elapsedTime,
                    message: result.message
                }
            }
        });

        res.status(200).json(result);

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                statusCode: error.statusCode || 500,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        // Use the existing error handler but ensure it gets the complete error info
        this.handleError(res, {
            ...error,
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
    }
  }

  async restoreDeletedArticle(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'restore_deleted_article',
        targetModel: 'Article',
        targetId: req.params.id,
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            restorationReason: req.body.reason || 'Not specified',
            requestDetails: {
                id: req.params.id,
                userRole: req.user.role
            }
        }
    });

    try {
        logger.info(`Restore deleted article request for ID: ${req.params.id} from IP: ${req.ip}`);

        const { reason } = req.body;

        // ID validation
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid article ID',
                    validationError: true,
                    providedId: req.params.id
                }
            });
            return res.status(400).json({ success: false, error: 'Invalid article ID' });
        }

        const result = await restoreDeletedArticle(
            req.params.id,
            req.user._id,
            reason || 'Article restoration by admin'
        );

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                restoredArticle: {
                    id: result.article._id,
                    title: result.article.title,
                    status: result.article.status
                },
                restorationReason: reason || 'Article restoration by admin',
                additionalLogsCreated: true
            }
        });

        res.status(200).json({
            success: true,
            message: 'Article restored successfully',
            data: {
                article: {
                    id: result.article._id,
                    title: result.article.title,
                    status: result.article.status
                }
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Complete the admin log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                errorType: error.name,
                ...(error.code && { errorCode: error.code })
            }
        });

        logger.error(`Restore article error: ${error.message}`, { error });
        
        // Use consistent error handling
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to restore article',
            ...(process.env.NODE_ENV === 'development' && {
                systemError: error.message,
                stack: error.stack
            })
        });
    }
  }

  async updateSystemSettings(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'update_system_settings',
        targetModel: 'SystemSettings',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedSettings: req.body.settings
        }
    });

    try {
        logger.info(`Update system settings request from IP: ${req.ip}`);    

        // Content-Type validation
        if (!req.is('application/json')) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid Content-Type',
                    contentType: req.get('Content-Type')
                }
            });
            return res.status(400).json({ 
                success: false, 
                error: 'Content-Type must be application/json' 
            });
        }

        const result = await updateSystemSettings(
            req.body.settings,
            req.user._id
        );

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                updatedSettings: result.updatedSettings,
                changeCount: result.updatedSettings?.length || 0
            }
        });

        res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {
        // Complete the admin log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                ...(error.code && { errorCode: error.code }),
                ...(error.statusCode && { httpStatusCode: error.statusCode })
            }
        });

        logger.error(`Update system settings error: ${error.message}`, { error });
        
        // Use the existing error handler but ensure it includes the admin log ID
        this.handleError(res, error, {
            adminLogId: logEntry._id,
            includeLogReference: true
        });
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

module.exports = new KnowledgeBaseAdminController();