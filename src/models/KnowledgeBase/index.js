const mongoose = require('mongoose');
const { AdminLog } = require('../AuditLog');

// Import all schemas
const articleSchema = require('../KnowledgeBase/schemas/articleSchema');
const categorySchema = require('./schemas/categorySchema');
const feedbackSchema = require('./schemas/feedbackSchema');
const ratingSchema = require('./schemas/ratingSchema');

// Register models if not already registered
const Article = mongoose.models.KnowledgeBaseArticle || mongoose.model('KnowledgeBase.Article', articleSchema);
const Category = mongoose.models.KnowledgeBaseCategory || mongoose.model('KnowledgeBase.Category', categorySchema);
const Feedback = mongoose.models.KnowledgeBaseFeedback || mongoose.model('KnowledgeBase.Feedback', feedbackSchema);
const Rating = mongoose.models.KnowledgeBaseRating || mongoose.model('KnowledgeBase.Rating', ratingSchema);

// Article Operations
const createArticle = require('./operations/article/createArticle');
const getArticle = require('./operations/article/getArticle');
const updateArticle = require('./operations/article/updateArticle');
const deleteArticle = require('./operations/article/deleteArticle');
const listArticles = require('./operations/article/listArticles');
const searchArticles = require('./operations/article/searchArticles');

// Category Operations
const createCategory = require('./operations/category/createCategory');
const getCategory = require('./operations/category/getCategory');
const updateCategory = require('./operations/category/updateCategory');
const deleteCategory = require('./operations/category/deleteCategory');
const listCategories = require('./operations/category/listCategories');

// Attachment Operations
const addAttachment = require('./operations/attachment/addAttachment');
const deleteAttachment = require('./operations/attachment/deleteAttachment');
const getAttachments = require('./operations/attachment/getAttachments');

// Feedback Operations
const addFeedback = require('./operations/feedback/addFeedback');
const getFeedback = require('./operations/feedback/getFeedback');
const updateFeedback = require('./operations/feedback/updateFeedback');

// Rating Operations
const addRating = require('./operations/rating/addRating');
const getAverageRating = require('./operations/rating/getAverageRating');
const updateRating = require('./operations/rating/updateRating');

// Versioning Operations
const getArticleHistory = require('./operations/versioning/getArticleHistory');
const getVersion = require('./operations/versioning/getVersion');
const restoreVersion = require('./operations/versioning/restoreVersion');

// Advanced Operations
const getFeaturedArticles = require('./operations/advancedOperations/getFeaturedArticles');
const getFrequentlyViewed = require('./operations/advancedOperations/getFrequentlyViewed');
const getMostHelpful = require('./operations/advancedOperations/getMostHelpful');
const getPopularArticles = require('./operations/advancedOperations/getPopularArticles');
const getRecentUpdates = require('./operations/advancedOperations/getRecentUpdates');

// Admin Special Operations
const bulkDeleteArticles = require('./operations/admin/bulkDeleteArticles');
const bulkUpdateArticles = require('./operations/admin/bulkUpdateArticles');
const exportAllData = require('./operations/admin/exportAllData');
const purgeOldVersions = require('./operations/admin/purgeOldVersions');
const rebuildSearchIndex = require('./operations/admin/rebuildSearchIndex');
const restoreDeletedArticle = require('./operations/admin/restoreDeletedArticle');
const updateSystemSettings = require('./operations/admin/updateSystemSettings');

// Export initialized models and operations
module.exports = {
  // Models
  Article,
  Category,
  Feedback,
  Rating,

  // ────────────────────────────────
  // 👥 All Users (Public/Authenticated)
  // ────────────────────────────────

  // Article Operations
  listArticles: listArticles.bind(null, Article),
  searchArticles: searchArticles.bind(null, Article),

  // Category Operations
  listCategories: listCategories.bind(null, Category),

  // Attachment Operations
  getAttachments: getAttachments.bind(null, Article),

  // Feedback Operations
  getFeedback: getFeedback.bind(null, Feedback),
  addFeedback: addFeedback.bind(null, Article, Feedback),

  // Rating Operations
  addRating: addRating.bind(null, Article, Rating),
  getAverageRating: getAverageRating.bind(null, Rating),

  // Versioning (Read-only)
  getArticleHistory: getArticleHistory.bind(null, Article),
  getVersion: getVersion.bind(null, Article),

  // Advanced Operations
  getFeaturedArticles: getFeaturedArticles.bind(null, Article),
  getFrequentlyViewed: getFrequentlyViewed.bind(null, Article),
  getMostHelpful: getMostHelpful.bind(null, Article),
  getPopularArticles: getPopularArticles.bind(null, Article),
  getRecentUpdates: getRecentUpdates.bind(null, Article),

  // ────────────────────────────────
  // 🛠️ Moderator & Admin Only
  // ────────────────────────────────

  // Article Operations
  createArticle: createArticle.bind(null, Article),
  getArticle: getArticle.bind(null, Article),
  updateArticle: updateArticle.bind(null, Article),
  deleteArticle: deleteArticle.bind(null, Article),

  // Category Operations
  createCategory: createCategory.bind(null, Category),
  getCategory: getCategory.bind(null, Category),
  updateCategory: updateCategory.bind(null, Category),
  deleteCategory: deleteCategory.bind(null, Category, Article),

  // Attachment Operations
  addAttachment: addAttachment.bind(null, Article),
  deleteAttachment: deleteAttachment.bind(null, Article),

  // Feedback Operations
  updateFeedback: updateFeedback.bind(null, Feedback),

  // Rating Operations
  updateRating: updateRating.bind(null, Rating),

  // Versioning (Restore)
  restoreVersion: restoreVersion.bind(null, Article),

  // ────────────────────────────────
  // 🛡️ Admin Only
  // ────────────────────────────────

  bulkDeleteArticles: bulkDeleteArticles.bind(null, Article),
  bulkUpdateArticles: bulkUpdateArticles.bind(null, Article),
  exportAllData: exportAllData.bind(null, Article, Category, Feedback, Rating),
  purgeOldVersions: purgeOldVersions.bind(null, Article),
  rebuildSearchIndex: rebuildSearchIndex.bind(null, Article),
  restoreDeletedArticle: restoreDeletedArticle.bind(null, Article),
  updateSystemSettings: updateSystemSettings.bind(null)
};
