const mongoose = require('mongoose');
const ticketSchema = require('./schemas/ticketSchema');
const commentSchema = require('./schemas/commentSchema');
const attachmentSchema = require('./schemas/attachmentSchema');

// Register models if not already registered
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
const Comment = mongoose.models.TicketComment || mongoose.model('Ticket.Comment', commentSchema);
const Attachment = mongoose.models.TicketAttachment || mongoose.model('Ticket.Attachment', attachmentSchema);

// Basic Ticket Operations
const createTicket = require('./operations/ticket/createTicket');
const getTicket = require('./operations/ticket/getTicket');
const updateTicket = require('./operations/ticket/updateTicket');
const moderatorUpdateTicket = require('./operations/ticket/moderatorUpdateTicket');
const deleteTicket = require('./operations/ticket/deleteTicket');
const moderatorDeleteTicket = require('./operations/ticket/moderatorDeleteTicket');
const listTickets = require('./operations/ticket/listTickets');

// Status Management Operations
const closeTicket = require('./operations/statusManagement/closeTicket');
const reopenTicket = require('./operations/statusManagement/reopenTicket');
const resolveTicket = require('./operations/statusManagement/resolveTicket');
const updateStatus = require('./operations/statusManagement/updateStatus');

// Assignment Operations
const assignTicket = require('./operations/assignment/assignTicket');
const reassignTicket = require('./operations/assignment/reassignTicket');
const unassignTicket = require('./operations/assignment/unassignTicket');

// Comment Operations
const addComment = require('./operations/comment/addComment');
const getComments = require('./operations/comment/getComments');
const deleteComment = require('./operations/comment/deleteComment');
const updateComment = require('./operations/comment/updateComment');

// Attachment Operations
const addAttachment = require('./operations/attachment/addAttachment');
const deleteAttachment = require('./operations/attachment/deleteAttachment');
const getAttachments = require('./operations/attachment/getAttachments');

// Escalation Operations
const escalateTicket = require('./operations/escalation/escalateTicket');
const deescalateTicket = require('./operations/escalation/deescalateTicket');

// Advanced Operations
const getAssignedTickets = require('./operations/advancedOperations/getAssignedTickets');
const getClosedTickets = require('./operations/advancedOperations/getClosedTickets');
const getEscalatedTickets = require('./operations/advancedOperations/getEscalatedTickets');
const getHighPriorityTickets = require('./operations/advancedOperations/getHighPriorityTickets');
const getOpenTickets = require('./operations/advancedOperations/getOpenTickets');
const getPendingTickets = require('./operations/advancedOperations/getPendingTickets');
const getResolvedTickets = require('./operations/advancedOperations/getResolvedTickets');
const getUserTickets = require('./operations/advancedOperations/getUserTickets');

module.exports = {
  // Models
  Ticket,
  Comment,
  Attachment,

  // ────────────────────────────────
  // 👥 All Users (Public/Authenticated)
  // ────────────────────────────────

  // Basic Ticket Operations
  createTicket: createTicket.bind(null, Ticket),
  getTicket: getTicket.bind(null, Ticket),
  listTickets: listTickets.bind(null, Ticket),

  // Basic Ticket Operations
  updateTicket: updateTicket.bind(null, Ticket),
  deleteTicket: deleteTicket.bind(null, Ticket, Attachment),

  // Status Management
  updateStatus: updateStatus.bind(null, Ticket),

  // Comment Operations
  addComment: addComment.bind(null, Ticket, Comment),
  deleteComment: deleteComment.bind(null, Ticket, Comment),
  updateComment: updateComment.bind(null, Ticket, Comment),
  getComments: getComments.bind(null, Comment),

  // Attachment Operations
  addAttachment: addAttachment.bind(null, Ticket, Attachment),
  getAttachments: getAttachments.bind(null, Attachment),

  // ────────────────────────────────
  // 🛠️ Moderator & Admin Only
  // ────────────────────────────────

  // Basic Ticket Operations
  moderatorUpdateTicket: moderatorUpdateTicket.bind(null, Ticket),
  moderatorDeleteTicket: moderatorDeleteTicket.bind(null, Ticket),

  // Status Management
  closeTicket: closeTicket.bind(null, Ticket),
  reopenTicket: reopenTicket.bind(null, Ticket),
  resolveTicket: resolveTicket.bind(null, Ticket),

  // Assignment Operations
  assignTicket: assignTicket.bind(null, Ticket),
  reassignTicket: reassignTicket.bind(null, Ticket),
  unassignTicket: unassignTicket.bind(null, Ticket),

  // Attachment Operations
  deleteAttachment: deleteAttachment.bind(null, Ticket, Attachment),

  // Escalation Operations
  escalateTicket: escalateTicket.bind(null, Ticket),
  deescalateTicket: deescalateTicket.bind(null, Ticket),

  // ────────────────────────────────
  // 🛡️ Admin Only
  // ────────────────────────────────

  // Advanced Ticket Queries
  getAssignedTickets: getAssignedTickets.bind(null, Ticket),
  getClosedTickets: getClosedTickets.bind(null, Ticket),
  getEscalatedTickets: getEscalatedTickets.bind(null, Ticket),
  getHighPriorityTickets: getHighPriorityTickets.bind(null, Ticket),
  getOpenTickets: getOpenTickets.bind(null, Ticket),
  getPendingTickets: getPendingTickets.bind(null, Ticket),
  getResolvedTickets: getResolvedTickets.bind(null, Ticket),
  getUserTickets: getUserTickets.bind(null, Ticket)
};