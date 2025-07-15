const RedisClient = require('../../../lib/redis');
const logger = require('../../../services/logger');
const mongoose = require('mongoose');
const AuditLog = require('../../../models/AuditLog/index');
const {
  updateTicket,
  deleteTicket,
  closeTicket,
  reopenTicket,
  resolveTicket,
  assignTicket,
  reassignTicket,
  unassignTicket,
  deleteComment,
  updateComment,
  escalateTicket,
  deescalateTicket,
} = require('../../../models/Ticket');

class TicketModeratorController {
  constructor() {
    this.redis = RedisClient;
    this.updateTicket = this.updateTicket.bind(this);
    this.deleteTicket = this.deleteTicket.bind(this);
    this.closeTicket = this.closeTicket.bind(this);
    this.reopenTicket = this.reopenTicket.bind(this);
    this.resolveTicket = this.resolveTicket.bind(this);
    this.assignTicket = this.assignTicket.bind(this);
    this.reassignTicket = this.reassignTicket.bind(this);
    this.unassignTicket = this.unassignTicket.bind(this);
    this.escalateTicket = this.escalateTicket.bind(this);
    this.deescalateTicket = this.deescalateTicket.bind(this);
    this.handleError = this.handleError.bind(this);
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


  async closeTicket(req, res) {
    try {
      logger.info(`Close ticket request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      const result = await closeTicket(
        req.params.id,
        req.user._id,
        req.body.reason
      );

      await AuditLog.createLog({
        action: 'ticket_close',
        event: 'close_ticket',
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
        message: 'Ticket closed successfully',
        ticketId: req.params.id,
        status: 'closed',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async reopenTicket(req, res) {
    try {
      logger.info(`Reopen ticket request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      const result = await reopenTicket(
        req.params.id,
        req.user._id,
        req.body.reason
      );

      await AuditLog.createLog({
        action: 'ticket_reopen',
        event: 'reopen_ticket',
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
        message: 'Ticket reopened successfully',
        ticketId: req.params.id,
        status: result.status,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async resolveTicket(req, res) {
    try {
      logger.info(`Resolve ticket request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      const result = await resolveTicket(
        req.params.id,
        req.user._id,
        req.body.resolution
      );

      await AuditLog.createLog({
        action: 'ticket_resolve',
        event: 'resolve_ticket',
        source: 'moderator',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          resolution: req.body.resolution || 'No resolution provided'
        }
      });

      res.status(200).json({
        message: 'Ticket resolved successfully',
        ticketId: req.params.id,
        status: 'resolved',
        resolution: result.resolution,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }


  async assignTicket(req, res) {
    try {
      logger.info(`Assign ticket request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      if (!mongoose.Types.ObjectId.isValid(req.body.assigneeId)) {
        throw new Error('Invalid assignee ID');
      }

      const result = await assignTicket(
        req.params.id,
        req.body.assigneeId,
        req.user._id
      );

      await AuditLog.createLog({
        action: 'ticket_assign',
        event: 'assign_ticket',
        source: 'moderator',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          assigneeId: req.body.assigneeId,
          previousAssignee: result.previousAssignee
        }
      });

      res.status(200).json({
        message: 'Ticket assigned successfully',
        ticketId: req.params.id,
        assigneeId: req.body.assigneeId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async reassignTicket(req, res) {
    try {
      logger.info(`Reassign ticket request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      if (!mongoose.Types.ObjectId.isValid(req.body.newAssigneeId)) {
        throw new Error('Invalid new assignee ID');
      }

      const result = await reassignTicket(
        req.params.id,
        req.body.newAssigneeId,
        req.user._id
      );

      await AuditLog.createLog({
        action: 'ticket_reassign',
        event: 'reassign_ticket',
        source: 'moderator',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          previousAssigneeId: result.previousAssignee,
          newAssigneeId: req.body.newAssigneeId
        }
      });

      res.status(200).json({
        message: 'Ticket reassigned successfully',
        ticketId: req.params.id,
        newAssigneeId: req.body.newAssigneeId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async unassignTicket(req, res) {
    try {
      logger.info(`Unassign ticket request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      const result = await unassignTicket(
        req.params.id,
        req.user._id
      );

      await AuditLog.createLog({
        action: 'ticket_unassign',
        event: 'unassign_ticket',
        source: 'moderator', 
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          previousAssignee: result.previousAssignee
        }
      });

      res.status(200).json({
        message: 'Ticket unassigned successfully',
        ticketId: req.params.id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }


  async escalateTicket(req, res) {
    try {
      logger.info(`Escalate ticket request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      const result = await escalateTicket(
        req.params.id,
        req.user._id,
        req.body.priority || 'high',
        req.body.reason || 'No reason provided'
      );

      await AuditLog.createLog({
        action: 'ticket_escalate',
        event: 'escalate_ticket',
        source: 'moderator',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          newPriority: result.newPriority,
          previousPriority: result.previousPriority
        }
      });

      res.status(200).json({
        message: 'Ticket escalated successfully',
        ticketId: req.params.id,
        priority: result.newPriority,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deescalateTicket(req, res) {
    try {
      logger.info(`Deescalate ticket request for ID: ${req.params.id} from IP: ${req.ip}`);

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid ticket ID');
      }

      const result = await deescalateTicket(
        req.params.id,
        req.user._id,
        req.body.priority || 'low',
        req.body.reason || 'No reason provided'
      );

      await AuditLog.createLog({
        action: 'ticket_deescalate',
        event: 'deescalate_ticket',
        source: 'moderator',
        targetId: req.params.id,
        performedBy: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          newPriority: result.newPriority,
          previousPriority: result.previousPriority
        }
      });

      res.status(200).json({
        message: 'Ticket deescalated successfully',
        ticketId: req.params.id,
        priority: result.newPriority,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  handleError(res, error) {
    logger.error(`Ticket moderator error: ${error.message}`, { stack: error.stack });
    
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

module.exports = new TicketModeratorController();