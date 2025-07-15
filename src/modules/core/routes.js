const express = require('express');
const router = express.Router();
const campaignController = require('./controllers/campaignBaseController');
const categoryController = require('./controllers/categoryBaseController'); 
const productController = require('./controllers/productsBaseController'); 
const knowledgeBaseController = require('./controllers/knowledgeBaseController');
const ticketController = require('./controllers/ticketController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 
const { authenticate } = require('../../core/security/jwt');

// ==================== Campaign routes ====================

router.get('/campaign/get', campaignController.getCampaigns);
router.get('/campaign/get/:id', authenticate, campaignController.getCampaign);

// ==================== Category routes ====================

router.get('/category/fetch/:id', categoryController.fetchCategory);
router.get('/category/fetch', categoryController.fetchCategories);

// ==================== Product routes ====================

// ───── Product Listing & Search ─────
router.get('/product', productController.listProducts);
router.get('/product/search', productController.searchProducts);
router.get('/product/category/:categoryId', productController.getProductsByCategory);

// ───── Related Products ─────
router.get('/product/related/:productId', productController.getRelatedProducts);
router.get('/product/similar/:productId', productController.getSimilarProducts);
router.get('/product/frequently-bought/:productId', productController.getFrequentlyBoughtTogether);

// ───── Special Groups ─────
router.get('/product/featured', productController.getFeaturedProducts);
router.get('/product/new-arrivals', productController.getNewArrivals);
router.get('/product/best-sellers', productController.getBestSellers);
router.get('/product/discounted', productController.getDiscountedProducts);
router.get('/product/trending', productController.getTrendingProducts);

// ───── Comments / Reviews ─────
router.post('/product/:id/reviews', authenticate, productController.addComment);
router.get('/product/:id/reviews', productController.getComments);
router.get('/product/:id/reviews/:reviewId', productController.getComment);
router.put('/product/:id/reviews/:reviewId', authenticate, productController.updateComment);
router.delete('/product/:id/reviews/:reviewId', authenticate, productController.deleteComment);

// ==================== Knowledge Base Feedback ====================
router.post('/knowledge-base/:id/feedback', authenticate, knowledgeBaseController.addFeedback);
router.get('/knowledge-base/feedback/:id', authenticate, knowledgeBaseController.getFeedback);

// ==================== Knowledge Base Attachments ====================
router.get('/knowledge-base/article/attachments/:id', authenticate, knowledgeBaseController.getAttachments);

// ==================== Knowledge Base Articles & Categories ====================
router.get('/knowledge-base/list', authenticate, knowledgeBaseController.listArticles);
router.get('/knowledge-base/search', authenticate, knowledgeBaseController.searchArticles);
router.get('/knowledge-base/category', authenticate, knowledgeBaseController.listCategories);

// ==================== Knowledge Base Ratings ====================
router.post('/knowledge-base/rating/:id/add', authenticate, knowledgeBaseController.addRating);
router.get('/knowledge-base/rating/average/:id', authenticate, knowledgeBaseController.getAverageRating);

// ==================== Knowledge Base Highlights ====================
router.get('/knowledge-base/featured', authenticate, knowledgeBaseController.getFeaturedArticles);
router.get('/knowledge-base/frequently-viewed', authenticate, knowledgeBaseController.getFrequentlyViewed);
router.get('/knowledge-base/most-helpful', authenticate, knowledgeBaseController.getMostHelpful);
router.get('/knowledge-base/popular', authenticate, knowledgeBaseController.getPopularArticles);
router.get('/knowledge-base/recent-updates', authenticate, knowledgeBaseController.getRecentUpdates);

// ==================== Knowledge Base Article History & Versions ====================
router.get('/knowledge-base/article/history/:id', authenticate, knowledgeBaseController.getArticleHistory);
router.get('/knowledge-base/version/:id/:version', authenticate, knowledgeBaseController.getVersion);

// ==================== Ticket Controller ====================

// Basic Ticket Operations
router.put('/ticket/update/:id', authenticate, ticketController.updateTicket);
router.delete('/ticket/delete/:id', authenticate, ticketController.deleteTicket);

// Ticket Status Operations
router.post('/ticket', authenticate, ticketController.createTicket);  
router.put('/ticket/:id', authenticate, ticketController.updateStatus);
router.get('/ticket/:id', authenticate, ticketController.getTicket);
router.get('/ticket', authenticate, ticketController.listTickets);
router.post('/ticket/attachment/add/:id', upload.array('files'), authenticate, ticketController.addAttachment);
router.delete('/ticket/attachment/:articleId/:attachmentId', authenticate, ticketController.deleteAttachment);
router.post('/ticket/comment/:id', authenticate, ticketController.addComment);
router.put('/ticket/comment/:id/:commentId', authenticate, ticketController.updateComment);
router.delete('/ticket/comment/:id/:commentId', authenticate, ticketController.deleteComment);
router.get('/ticket/comment/:id', authenticate, ticketController.getComments);


module.exports = router;