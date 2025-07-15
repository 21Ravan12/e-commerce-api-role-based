const express = require('express');
const router = express.Router();
const categoryController = require('./controllers/categoryController');
const knowledgeBaseAdminController = require('./controllers/knowledgeBaseController');
const ticketController = require('./controllers/TicketController');

// ==================== Category routes ====================
router.post('/category/add', categoryController.addCategory);
router.put('/category/update/:id', categoryController.updateCategory);
router.delete('/category/delete/:id', categoryController.deleteCategory);

// ==================== Knowledge Base Admin Routes ====================
router.delete('/knowledge-base/bulk-delete', knowledgeBaseAdminController.bulkDeleteArticles);
router.put('/knowledge-base/bulk-update', knowledgeBaseAdminController.bulkUpdateArticles);
router.get('/knowledge-base/export', knowledgeBaseAdminController.exportAllData);
router.post('/knowledge-base/purge-versions', knowledgeBaseAdminController.purgeOldVersions);
router.post('/knowledge-base/rebuild-index', knowledgeBaseAdminController.rebuildSearchIndex);
router.put('/knowledge-base/restore-article/:id', knowledgeBaseAdminController.restoreDeletedArticle);
router.put('/knowledge-base/system-settings', knowledgeBaseAdminController.updateSystemSettings);

// ==================== Ticket Controller ====================
router.get('/tickets/assigned', ticketController.getAssignedTickets);
router.get('/tickets/closed', ticketController.getClosedTickets);
router.get('/tickets/escalated', ticketController.getEscalatedTickets);
router.get('/tickets/high-priority', ticketController.getHighPriorityTickets);
router.get('/tickets/open', ticketController.getOpenTickets);
router.get('/tickets/pending', ticketController.getPendingTickets);
router.get('/tickets/resolved', ticketController.getResolvedTickets);
router.get('/tickets/user/:userId', ticketController.getUserTickets);

module.exports = router;