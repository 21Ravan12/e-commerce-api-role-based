const RedisClient = require('../../../lib/redis');
const logger = require('../../../services/logger');
const mongoose = require('mongoose');
const AuditLog = require('../../../models/AuditLog/index');
const {
  createTicket,
  getTicket,
  listTickets,
  updateStatus,
  addComment,
  getComments,
  addAttachment,
  deleteComment,
  updateComment,
  updateTicket,
  deleteTicket,
  deleteAttachment
} = require('../../../models/Ticket');

class TicketController {
  constructor() {
    this.redis = RedisClient;
    this.handleError = this.handleError.bind(this);
    this.updateTicket = this.updateTicket.bind(this);
    this.deleteTicket = this.deleteTicket.bind(this);
    this.createTicket = this.createTicket.bind(this);
    this.getTicket = this.getTicket.bind(this);
    this.listTickets = this.listTickets.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.updateComment = this.updateComment.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.addComment = this.addComment.bind(this);
    this.getComments = this.getComments.bind(this);
    this.addAttachment = this.addAttachment.bind(this);
    this.deleteAttachment = this.deleteAttachment.bind(this);
  }

  async createTicket(req, res) {
    try {
      logger.info(`Create ticket request from IP: ${req.ip}`);

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      const { title, subject, description, priority = 'medium', category } = req.body;

      if (!subject || !description) {
        throw new Error('Subject and description are required');
      }

      const ticket = await createTicket(
        {
          title,
          subject,
          description,
          priority,
          category,
          createdBy: req.user._id,
          status: 'open'
        },
        req.user._id
      );

      // Log the action
      await AuditLog.createLog({
        action: 'ticket_create',
        event: 'create_ticket',
        source: 'web',        
        targetModel: 'Ticket',
        targetId: ticket._id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          subject: ticket.subject,
          priority: ticket.priority
        }
      });

      res.status(201).json({
        message: 'Ticket created successfully',
        ticketId: ticket._id,
        status: ticket.status,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTicket(req, res) {
    try {
      logger.info(`Get ticket request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      const ticket = await getTicket(req.params.id);

      // Log the action
      await AuditLog.createLog({
        action: 'ticket_view',
        event: 'view_ticket',
        source: 'web',        
        targetModel: 'Ticket',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        ticket,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async listTickets(req, res) {
    try {
      logger.info(`List tickets request from IP: ${req.ip}`);

      const { 
        page = 1, 
        limit = 10, 
        status = 'open', 
        priority = 'medium', 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      filter.createdBy = req.user._id;

      const tickets = await listTickets(
        {
          page: parseInt(page),
          limit: parseInt(limit),
          sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
          filter
        }
      );

      // Log the action
      await AuditLog.createLog({
        action: 'ticket_list',
        event: 'list_ticket',
        source: 'web', 
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          page,
          limit,
          filter
        }
      });

      res.status(200).json({
        data: tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: tickets.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateStatus(req, res) {
    try {
      logger.info(`Update ticket status request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      const { status, reason } = req.body;

      if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        throw new Error('Invalid status value');
      }

      const updatedTicket = await updateStatus(
        req.params.id,
        req.user._id,
        status,
        reason
      );

      // Log the action
      await AuditLog.createLog({
        action: 'ticket_status_update',
        event: 'update_ticket_status',
        source: 'web',        
        targetModel: 'Ticket',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          oldStatus: updatedTicket.previousStatus,
          newStatus: updatedTicket.status,
          reason
        }
      });

      res.status(200).json({
        message: 'Ticket status updated successfully',
        ticketId: req.params.id,
        newStatus: updatedTicket.status,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }


  async updateTicket(req, res) {
    try {
      logger.info(`Update ticket request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      const result = await updateTicket(
        req.params.id,
        req.user._id,
        req.body.updates,
      );

      await AuditLog.createLog({
        action: 'ticket_update',
        event: 'update_ticket',
        source: 'moderator',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          updates: req.body.updates
        }
      });

      res.status(200).json({
        message: 'Ticket updated successfully',
        ticketId: req.params.id,
        updatedFields: Object.keys(req.body.updates),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteTicket(req, res) {
    try {
      logger.info(`Delete ticket request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      const result = await deleteTicket(
        req.params.id,
        req.user._id
      );

      await AuditLog.createLog({
        action: 'ticket_delete',
        event: 'delete_ticket',
        source: 'moderator',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          reason: req.body.reason || 'No reason provided'
        }
      });

      res.status(200).json({
        message: 'Ticket deleted successfully',
        ticketId: req.params.id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }


  async addComment(req, res) {
    try {
      logger.info(`Add comment to ticket ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      const { text, isInternal = false } = req.body;

      if (!text) {
        throw new Error('Comment text is required');
      }

      const comment = await addComment(
        req.params.id,
        req.user._id,
        text,
        isInternal
      );

      // Log the action
      await AuditLog.createLog({
        action: 'ticket_add_comment',
        event: 'comment_ticket_add',
        source: 'web',        
        targetModel: 'Ticket',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          commentId: comment._id,
          isInternal
        }
      });

      res.status(201).json({
        message: 'Comment added successfully',
        commentId: comment._id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteComment(req, res) {
    try {
      logger.info(`Delete comment request for ID: ${req.params.commentId} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
        throw new Error('Invalid comment ID');
      }

      const result = await deleteComment(
        req.params.commentId,
        req.user._id
      );

      await AuditLog.createLog({
        action: 'comment_delete',
        event: 'delete_comment',
        source: 'web',
        targetId: req.params.commentId,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          ticketId: result.ticketId,
          commentAuthor: result.commentAuthor
        }
      });

      res.status(200).json({
        message: 'Comment deleted successfully',
        commentId: req.params.commentId,
        ticketId: result.ticketId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateComment(req, res) {
    try {
      logger.info(`Update comment request for ID: ${req.params.commentId} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
        throw new Error('Invalid comment ID');
      }

      if (!req.is('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      const result = await updateComment(
        req.params.commentId,
        req.user._id,
        req.body.content
      );

      await AuditLog.createLog({
        action: 'comment_update',
        event: 'update_comment',
        source: 'web',
        targetId: req.params.commentId,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          ticketId: result.ticketId,
          previousContent: result.previousContent
        }
      });

      res.status(200).json({
        message: 'Comment updated successfully',
        commentId: req.params.commentId,
        ticketId: result.ticketId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getComments(req, res) {
    try {
      logger.info(`Get comments for ticket ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      const { includeInternal = false } = req.query;
      const showInternal = req.user.role === 'admin' && includeInternal === 'true';

      const comments = await getComments(
        req.params.id,
        showInternal
      );

      // Log the action
      await AuditLog.createLog({
        action: 'ticket_get_comments',
        event: 'comments_get_ticket',
        source: 'web',        
        targetModel: 'Ticket',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          commentsCount: comments.length,
          includeInternal: showInternal
        }
      });

      res.status(200).json({
        ticketId: req.params.id,
        comments,
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
        req.user._id,
        attachmentData,
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

  handleError(res, error) {
    logger.error(`TicketController error: ${error.message}`, { stack: error.stack });
    
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

module.exports = new TicketController();