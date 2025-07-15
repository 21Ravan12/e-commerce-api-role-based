const RedisClient = require('../../../../../lib/redis');
const logger = require('../../../../../services/logger');
const mongoose = require('mongoose');
const AuditLog = require('../../../../../models/AuditLog/index');
const {
  Ticket,
  getAssignedTickets,
  getClosedTickets,
  getEscalatedTickets,
  getHighPriorityTickets,
  getOpenTickets,
  getPendingTickets,
  getResolvedTickets,
  getUserTickets
} = require('../../../../../models/Ticket');

class TicketAdminController {
  constructor() {
    this.redis = RedisClient;
    this.handleError = this.handleError.bind(this);
    this.getAssignedTickets = this.getAssignedTickets.bind(this);
    this.getClosedTickets = this.getClosedTickets.bind(this);
    this.getEscalatedTickets = this.getEscalatedTickets.bind(this);
    this.getHighPriorityTickets = this.getHighPriorityTickets.bind(this);
    this.getOpenTickets = this.getOpenTickets.bind(this);
    this.getPendingTickets = this.getPendingTickets.bind(this);
    this.getResolvedTickets = this.getResolvedTickets.bind(this);
    this.getUserTickets = this.getUserTickets.bind(this);
  }

  async getAssignedTickets(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'get_assigned_tickets',
        targetModel: 'Ticket',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedUserId: req.query.userId || 'self',
            pagination: {
                requestedPage: req.query.page,
                requestedLimit: req.query.limit
            }
        }
    });

    try {
        const { userId, page = 1, limit = 10 } = req.query;
        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

        // Validate if requesting tickets for another user (admin privilege)
        if (userId && userId !== req.user._id.toString() && !req.user.roles.includes('admin')) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Unauthorized access attempt',
                    unauthorized: true,
                    requesterId: req.user._id.toString(),
                    requesterRoles: req.user.roles
                }
            });
            return res.status(403).json({ 
                success: false, 
                error: 'Unauthorized to view other users tickets' 
            });
        }

        const result = await getAssignedTickets(
            userId || req.user._id,
            {
                page: pageNumber,
                limit: limitNumber
            }
        );

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                targetUserId: userId || req.user._id.toString(),
                finalPagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limitNumber)
                },
                returnedCount: result.tickets.length
            }
        });

        res.status(200).json({
            success: true,
            data: result.tickets,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: result.total,
                totalPages: Math.ceil(result.total / limitNumber)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        logger.error(`Get assigned tickets error: ${error.message}`, { error });
        
        // Use consistent error handling
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve assigned tickets',
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
  }

  async getClosedTickets(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'get_closed_tickets',
        targetModel: 'Ticket',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            queryParameters: {
                days: req.query.days,
                page: req.query.page,
                limit: req.query.limit
            }
        }
    });

    try {
        const { days = 30, page = 1, limit = 10 } = req.query;
        const daysNumber = parseInt(days);
        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

        const result = await getClosedTickets(
            {
                days: daysNumber,
                page: pageNumber,
                limit: limitNumber
            }
        );

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                finalParameters: {
                    days: daysNumber,
                    page: pageNumber,
                    limit: limitNumber
                },
                resultsCount: result.tickets.length,
                totalCount: result.total
            }
        });

        res.status(200).json({
            success: true,
            data: result.tickets,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: result.total,
                totalPages: Math.ceil(result.total / limitNumber)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        logger.error(`Get closed tickets error: ${error.message}`, { 
            error,
            stack: error.stack 
        });

        this.handleError(res, error);
    }
  }

  async getEscalatedTickets(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'get_escalated_tickets',
        targetModel: 'Ticket',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            pagination: {
                requestedPage: req.query.page,
                requestedLimit: req.query.limit
            }
        }
    });

    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

        const result = await getEscalatedTickets(
            {
                page: pageNumber,
                limit: limitNumber
            }
        );

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                finalPagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limitNumber)
                },
                returnedCount: result.tickets.length,
                escalationLevels: Array.from(new Set(result.tickets.map(t => t.escalationLevel)))
            }
        });

        res.status(200).json({
            success: true,
            data: result.tickets,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: result.total,
                totalPages: Math.ceil(result.total / limitNumber)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        logger.error(`Get escalated tickets error: ${error.message}`, error.stack);
        this.handleError(res, error);
    }
  }

  async getHighPriorityTickets(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'get_high_priority_tickets',
        targetModel: 'Ticket',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            pagination: {
                requestedPage: req.query.page,
                requestedLimit: req.query.limit
            }
        }
    });

    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

        const result = await getHighPriorityTickets(
            Ticket,
            {
                page: pageNumber,
                limit: limitNumber
            }
        );

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                finalPagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limitNumber)
                },
                returnedCount: result.tickets.length,
                priorityLevel: 'high' // Explicitly noting this is for high priority tickets
            }
        });

        res.status(200).json({
            success: true,
            data: result.tickets,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: result.total,
                totalPages: Math.ceil(result.total / limitNumber)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        logger.error(`Get high priority tickets error: ${error.message}`, {
            error,
            ip: req.ip,
            user: req.user._id
        });

        this.handleError(res, error);
    }
  }

  async getOpenTickets(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'get_open_tickets',
        targetModel: 'Ticket',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            pagination: {
                requestedPage: req.query.page,
                requestedLimit: req.query.limit
            }
        }
    });

    try {
        logger.info(`Get open tickets request from IP: ${req.ip}`);

        const { page = 1, limit = 10 } = req.query;
        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

        const result = await getOpenTickets(
            {
                page: pageNumber,
                limit: limitNumber
            }
        );

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                resultsCount: result.tickets.length,
                finalPagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limitNumber)
                }
            }
        });

        res.status(200).json({
            success: true,
            data: result.tickets,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: result.total,
                totalPages: Math.ceil(result.total / limitNumber)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Complete the admin log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        this.handleError(res, error);
    }
  }

  async getPendingTickets(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'get_pending_tickets',
        targetModel: 'Ticket',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            pagination: {
                requestedPage: req.query.page,
                requestedLimit: req.query.limit
            }
        }
    });

    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit))) || 10;

        const result = await getPendingTickets(
            {
                page: pageNumber,
                limit: limitNumber
            }
        );

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                finalPagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limitNumber)
                },
                returnedCount: result.tickets.length,
                ticketStatuses: [...new Set(result.tickets.map(t => t.status))]
            }
        });

        res.status(200).json({
            success: true,
            data: result.tickets,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: result.total,
                totalPages: Math.ceil(result.total / limitNumber)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Complete the admin log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        // Use the existing error handler
        this.handleError(res, error);
    }
  }

  async getResolvedTickets(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'get_resolved_tickets',
        targetModel: 'Ticket',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            queryParameters: {
                days: req.query.days,
                page: req.query.page,
                limit: req.query.limit
            }
        }
    });

    try {
        const { days = 30, page = 1, limit = 10 } = req.query;
        const daysNumber = parseInt(days);
        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

        // Get tickets with pagination metadata
        const { tickets, total } = await getResolvedTickets(
            {
                days: daysNumber,
                page: pageNumber,
                limit: limitNumber
            }
        );

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                finalQueryParameters: {
                    days: daysNumber,
                    page: pageNumber,
                    limit: limitNumber
                },
                resultsCount: tickets.length,
                totalCount: total,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total,
                    totalPages: Math.ceil(total / limitNumber)
                }
            }
        });

        res.status(200).json({
            success: true,
            data: tickets,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages: Math.ceil(total / limitNumber)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        logger.error(`Get resolved tickets error: ${error.message}`, { 
            error,
            stack: error.stack 
        });

        // Use consistent error handling
        res.status(500).json({ 
            success: false, 
            error: 'Could not retrieve resolved tickets',
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
  }

  async getUserTickets(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'get_user_tickets',
        targetModel: 'User',
        targetId: req.params.userId,
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedUserId: req.params.userId,
            pagination: {
                requestedPage: req.query.page,
                requestedLimit: req.query.limit
            }
        }
    });

    try {
        const userId = req.params.userId;
        const { page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid user ID',
                    validationError: true
                }
            });
            throw new Error('Invalid user ID');
        }

        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit))) || 10;

        const { tickets, total } = await getUserTickets(
            userId,
            {
                page: pageNumber,
                limit: limitNumber
            }
        );

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                resultsCount: tickets.length,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total: total,
                    totalPages: Math.ceil(total / limitNumber)
                }
            }
        });

        res.status(200).json({
            success: true,
            userId: userId,
            data: tickets,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: total,
                totalPages: Math.ceil(total / limitNumber)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Complete the admin log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        // Log the error with logger
        logger.error(`Get user tickets error: ${error.message}`, {
            userId: req.params.userId,
            error: error.stack
        });

        // Use the error handler
        this.handleError(res, error, {
            userId: req.params.userId,
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }

  handleError(res, error) {
    logger.error(`Ticket admin error: ${error.message}`, { stack: error.stack });
    
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

module.exports = new TicketAdminController();