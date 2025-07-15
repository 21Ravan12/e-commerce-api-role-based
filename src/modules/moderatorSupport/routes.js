const express = require('express');
const router = express.Router();
const knowledgeBaseController = require('./controllers/knowledgeBaseController');
const returnRequestController = require('./controllers/returnRequestController');
const logController = require('./controllers/logController');
const ticketController = require('./controllers/ticketController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 
const { authenticate } = require('../../core/security/jwt');

// ==================== Knowledge Base Controller ====================

router.post('/knowledge-base/add', knowledgeBaseController.createArticle);
router.get('/knowledge-base/article/:id', knowledgeBaseController.getArticle);
router.put('/knowledge-base/update/:id', knowledgeBaseController.updateArticle);
router.delete('/knowledge-base/delete/:id', knowledgeBaseController.deleteArticle);

router.get('/knowledge-base/category/:id', knowledgeBaseController.getCategory);
router.post('/knowledge-base/category/add', knowledgeBaseController.createCategory);
router.put('/knowledge-base/category/update/:id', knowledgeBaseController.updateCategory);
router.delete('/knowledge-base/category/delete/:id', knowledgeBaseController.deleteCategory);

router.post('/knowledge-base/attachment/add/:id', upload.array('files'), knowledgeBaseController.addAttachment);
router.delete('/knowledge-base/attachment/delete/:articleId/:attachmentId', knowledgeBaseController.deleteAttachment);

router.put('/knowledge-base/feedback/update/:id', knowledgeBaseController.updateFeedback);
router.put('/knowledge-base/rating/update/:id', knowledgeBaseController.updateRating);
router.post('/knowledge-base/version/restore/:id', knowledgeBaseController.restoreVersion);

// ==================== ReturnRequest ROUTES ====================

router.get('/returnRequest/get', returnRequestController.getReturnRequests);
router.get('/returnRequest/get/:id/:userId', returnRequestController.getReturnRequest);
router.put('/returnRequest/update/:id', returnRequestController.reviewAndUpdateReturnRequest);
router.put('/returnRequest/archive/:id', returnRequestController.archiveReturnRequest);

// ==================== Log Controller ====================

router.get('/logs/user/:userId', logController.getLogsByUser);
router.get('/logs/audit', logController.searchAuditLogs);
router.get('/logs/admin', logController.searchAdminLogs);
router.get('/logs/audit/:correlationId', logController.getAuditLogByCorrelationId);
router.get('/logs/admin/:correlationId', logController.getAdminLogByCorrelationId);

// ==================== Ticket Controller ====================

// Basic Ticket Operations
router.put('/ticket/update/:id', ticketController.updateTicket);
router.delete('/ticket/delete/:id', ticketController.deleteTicket);

// Ticket Status Operations
router.post('/ticket/close/:id', ticketController.closeTicket);
router.post('/ticket/reopen/:id', ticketController.reopenTicket);
router.post('/ticket/resolve/:id', ticketController.resolveTicket);

// Assignment Operations
router.post('/ticket/assign/:id', ticketController.assignTicket);
router.post('/ticket/reassign/:id', ticketController.reassignTicket);
router.post('/ticket/unassign/:id', ticketController.unassignTicket);

// Priority Operations
router.post('/ticket/escalate/:id', ticketController.escalateTicket);
router.post('/ticket/deescalate/:id', ticketController.deescalateTicket);


module.exports = router;