## Directory Structure
e-commerce-api(role-based)
│   .dockerignore
│   .env
│   docker-compose.yml
│   Dockerfile
│   LICENSE
│   package-lock.json
│   package.json
│   README.md
│   
├───docs
│   │   ARCHITECTURE.md
│   │   CONTRIBUTING.md
│   │   FILEROUTE.md
│   │   
│   ├───core
│   │   ├───middlewares
│   │   │       validation.md
│   │   │       
│   │   ├───security
│   │   │       csrf.md
│   │   │       jwt.md
│   │   │       rate_limiting.md
│   │   │       
│   │   └───utilities
│   │           cryptography.md
│   │           password_policy.md
│   │
│   ├───levelComparison
│   │       Pro&Lite.md
│   │       
│   ├───lib
│   │       redis.md
│   │       
│   ├───models
│   │       AuditLog.md
│   │       Campaign.md
│   │       KnowledgeBase.md
│   │       Notification.md
│   │       Order.md
│   │       Payment.md
│   │       Product.md
│   │       PromotionCode.md
│   │       ReturnRequest.md
│   │       Ticket.md
│   │       User.md
│   │
│   ├───modules
│   │   ├───admin
│   │   │   │   routes.md
│   │   │   │
│   │   │   └───components
│   │   │       ├───commerce-manager
│   │   │       │   │   routes.md
│   │   │       │   │
│   │   │       │   ├───controllers
│   │   │       │   │   ├───campaignController
│   │   │       │   │   │       addCampaign.md
│   │   │       │   │   │       deleteCampaign.md
│   │   │       │   │   │       updateCampaign.md
│   │   │       │   │   │
│   │   │       │   │   ├───ordersController
│   │   │       │   │   │       getAdminOrders.md
│   │   │       │   │   │       updateOrderStatus.md
│   │   │       │   │   │
│   │   │       │   │   ├───paymentController
│   │   │       │   │   │       findByOrder.md
│   │   │       │   │   │       getPayment.md
│   │   │       │   │   │       getPayments.md
│   │   │       │   │   │       totalRevenue.md
│   │   │       │   │   │
│   │   │       │   │   └───promotionController
│   │   │       │   │           getPromotionCode.md
│   │   │       │   │           getPromotionCodes.md
│   │   │       │   │
│   │   │       │   └───schemas
│   │   │       │           campaignSchema.md
│   │   │       │           ordersSchema.md
│   │   │       │
│   │   │       ├───content-manager
│   │   │       │   │   routes.md
│   │   │       │   │
│   │   │       │   ├───controllers
│   │   │       │   │   ├───categoryController
│   │   │       │   │   │       addCategory.md
│   │   │       │   │   │       deleteCategory.md
│   │   │       │   │   │       updateCategory.md
│   │   │       │   │   │
│   │   │       │   │   ├───knowledgeBaseController
│   │   │       │   │   │       bulkDeleteArticles.md
│   │   │       │   │   │       bulkUpdateArticles.md
│   │   │       │   │   │       exportAllData.md
│   │   │       │   │   │       purgeOldVersions.md
│   │   │       │   │   │       rebuildSearchIndex.md
│   │   │       │   │   │       restoreDeletedArticle.md
│   │   │       │   │   │       updateSystemSettings.md
│   │   │       │   │   │
│   │   │       │   │   └───ticketController
│   │   │       │   │           getAssignedTickets.md
│   │   │       │   │           getClosedTickets.md
│   │   │       │   │           getEscalatedTickets.md
│   │   │       │   │           getHighPriorityTickets.md
│   │   │       │   │           getOpenTickets.md
│   │   │       │   │           getPendingTickets.md
│   │   │       │   │           getResolvedTickets.md
│   │   │       │   │           getUserTickets.md
│   │   │       │   │
│   │   │       │   └───schemas
│   │   │       │           categorySchema.md
│   │   │       │
│   │   │       └───user-manager
│   │   │           │   routes.md
│   │   │           │
│   │   │           ├───controller
│   │   │           │       assignRoles.md
│   │   │           │       deleteUser.md
│   │   │           │       getUser.md
│   │   │           │       listUsers.md
│   │   │           │       updateUserStatus.md
│   │   │           │
│   │   │           └───services
│   │   │                   accessControl.md
│   │   │                   roleAssignment.md
│   │   │
│   │   ├───core
│   │   │   │   routes.md
│   │   │   │
│   │   │   ├───controllers
│   │   │   │   ├───campaignBaseController
│   │   │   │   │       getCampaign.md
│   │   │   │   │       getCampaigns.md
│   │   │   │   │
│   │   │   │   ├───categoryBaseController
│   │   │   │   │       fetchCategories.md
│   │   │   │   │       fetchCategory.md
│   │   │   │   │
│   │   │   │   ├───knowledgeBaseController
│   │   │   │   │   ├───knowledgeBaseArticleHistory&Versions
│   │   │   │   │   │       getArticleHistory.md
│   │   │   │   │   │       getVersion.md
│   │   │   │   │   │
│   │   │   │   │   ├───knowledgeBaseArticles&Categories
│   │   │   │   │   │       listArticles.md
│   │   │   │   │   │       listCategories.md
│   │   │   │   │   │       searchArticles.md
│   │   │   │   │   │
│   │   │   │   │   ├───knowledgeBaseAttachments
│   │   │   │   │   │       getAttachments.md
│   │   │   │   │   │
│   │   │   │   │   ├───knowledgeBaseFeedback
│   │   │   │   │   │       addFeedback.md
│   │   │   │   │   │       getFeedback.md
│   │   │   │   │   │
│   │   │   │   │   ├───knowledgeBaseHighlights
│   │   │   │   │   │       getFeaturedArticles.md
│   │   │   │   │   │       getFrequentlyViewed.md
│   │   │   │   │   │       getMostHelpful.md
│   │   │   │   │   │       getPopularArticles.md
│   │   │   │   │   │       getRecentUpdates.md
│   │   │   │   │   │
│   │   │   │   │   └───knowledgeBaseRatings
│   │   │   │   │           addRating.md
│   │   │   │   │           getAverageRating.md
│   │   │   │   │
│   │   │   │   ├───productsBaseController
│   │   │   │   │   ├───comments&Reviews
│   │   │   │   │   │       addComment.md
│   │   │   │   │   │       deleteComment.md
│   │   │   │   │   │       getComment.md
│   │   │   │   │   │       getComments.md
│   │   │   │   │   │       updateComment.md
│   │   │   │   │   │
│   │   │   │   │   ├───productListing&Search
│   │   │   │   │   │       getProductsByCategory.md
│   │   │   │   │   │       listProducts.md
│   │   │   │   │   │       searchProducts.md
│   │   │   │   │   │
│   │   │   │   │   ├───relatedProducts
│   │   │   │   │   │       getFrequentlyBoughtTogether.md
│   │   │   │   │   │       getRelatedProducts.md
│   │   │   │   │   │       getSimilarProducts.md
│   │   │   │   │   │
│   │   │   │   │   └───specialGroups
│   │   │   │   │           getBestSellers.md
│   │   │   │   │           getDiscountedProducts.md
│   │   │   │   │           getFeaturedProducts.md
│   │   │   │   │           getNewArrivals.md
│   │   │   │   │           getTrendingProducts.md
│   │   │   │   │
│   │   │   │   └───ticketController
│   │   │   │       ├───basicTicketOperations
│   │   │   │       │       deleteTicket.md
│   │   │   │       │       updateTicket.md
│   │   │   │       │
│   │   │   │       └───ticketStatusOperations
│   │   │   │               addAttachment.md
│   │   │   │               addComment.md
│   │   │   │               createTicket.md
│   │   │   │               deleteAttachment.md
│   │   │   │               deleteComment.md
│   │   │   │               getComments.md
│   │   │   │               getTicket.md
│   │   │   │               listTickets.md
│   │   │   │               updateComment.md
│   │   │   │               updateStatus.md
│   │   │   │
│   │   │   ├───schemas
│   │   │   │       productsSchema.md
│   │   │   │
│   │   │   └───services
│   │   │       └───payment
│   │   │           │   PaymentError.md
│   │   │           │   PaymentProcessor.md
│   │   │           │
│   │   │           └───providers
│   │   │                   CODProvider.md
│   │   │                   PayPalProvider.md
│   │   │                   StripeProvider.md
│   │   │
│   │   ├───costumer
│   │   │   │   routes.md
│   │   │   │
│   │   │   ├───controllers
│   │   │   │   ├───commerceController
│   │   │   │   │   ├───cartCRUD
│   │   │   │   │   │       addToCart.md
│   │   │   │   │   │       clearCart.md
│   │   │   │   │   │       getCart.md
│   │   │   │   │   │       removeFromCart.md
│   │   │   │   │   │       updateCartItem.md
│   │   │   │   │   │
│   │   │   │   │   └───wishlistCRUD
│   │   │   │   │           addToWishlist.md
│   │   │   │   │           getWishlist.md
│   │   │   │   │           removeFromWishlist.md
│   │   │   │   │
│   │   │   │   ├───ordersController
│   │   │   │   │       cancelOrder.md
│   │   │   │   │       createOrder.md
│   │   │   │   │       getOrderDetails.md
│   │   │   │   │       getOrders.md
│   │   │   │   │
│   │   │   │   └───returnRequestController
│   │   │   │           archiveReturnRequest.md
│   │   │   │           createReturnRequest.md
│   │   │   │           getReturnRequest.md
│   │   │   │           getReturnRequests.md
│   │   │   │           reviewAndUpdateReturnRequest.md
│   │   │   │           updateReturnRequest.md
│   │   │   │
│   │   │   ├───schemas
│   │   │   │       ordersSchema.md
│   │   │   │       returnRequestSchema.md
│   │   │   │
│   │   │   └───services
│   │   │           service.md
│   │   │
│   │   ├───moderatorSupport
│   │   │   │   routes.md
│   │   │   │
│   │   │   ├───controllers
│   │   │   │   ├───knowledgeBaseController
│   │   │   │   │   ├───articleCategoryOperations
│   │   │   │   │   │       createCategory.md
│   │   │   │   │   │       deleteCategory.md
│   │   │   │   │   │       getCategory.md
│   │   │   │   │   │       updateCategory.md
│   │   │   │   │   │
│   │   │   │   │   ├───articleOperations
│   │   │   │   │   │       createArticle.md
│   │   │   │   │   │       deleteArticle.md
│   │   │   │   │   │       getArticle.md
│   │   │   │   │   │       updateArticle.md
│   │   │   │   │   │
│   │   │   │   │   ├───attachmentOperations
│   │   │   │   │   │       addAttachment.md
│   │   │   │   │   │       deleteAttachment.md
│   │   │   │   │   │
│   │   │   │   │   └───otherOperations
│   │   │   │   │           restoreVersion.md
│   │   │   │   │           updateFeedback.md
│   │   │   │   │           updateRating.md
│   │   │   │   │
│   │   │   │   └───ticketController
│   │   │   │       ├───assignmentOperations
│   │   │   │       │       assignTicket.md
│   │   │   │       │       reassignTicket.md
│   │   │   │       │       unassignTicket.md
│   │   │   │       │
│   │   │   │       ├───basicTicketOperations
│   │   │   │       │       deleteTicket.md
│   │   │   │       │       updateTicket.md
│   │   │   │       │
│   │   │   │       ├───priorityOperations
│   │   │   │       │       deescalateTicket.md
│   │   │   │       │       escalateTicket.md
│   │   │   │       │
│   │   │   │       └───ticketStatusOperations
│   │   │   │               closeTicket.md
│   │   │   │               reopenTicket.md
│   │   │   │               resolveTicket.md
│   │   │   │
│   │   │   └───schemas
│   │   ├───seller
│   │   │   │   routes.md
│   │   │   │
│   │   │   ├───controllers
│   │   │   │   ├───campaignController
│   │   │   │   │       addCampaign.md
│   │   │   │   │       deleteCampaign.md
│   │   │   │   │       updateCampaign.md
│   │   │   │   │
│   │   │   │   ├───productsController
│   │   │   │   │   ├───inventoryManagement
│   │   │   │   │   │       bulkUpdatePrices.md
│   │   │   │   │   │       bulkUpdateStock.md
│   │   │   │   │   │       getLowStockProducts.md
│   │   │   │   │   │       getOutOfStockProducts.md
│   │   │   │   │   │
│   │   │   │   │   ├───mediaManagement
│   │   │   │   │   │       deleteProductMedia.md
│   │   │   │   │   │       reorderProductMedia.md
│   │   │   │   │   │       uploadProductMedia.md
│   │   │   │   │   │
│   │   │   │   │   └───productCRUDOperations
│   │   │   │   │           createProduct.md
│   │   │   │   │           deleteProduct.md
│   │   │   │   │           getProduct.md
│   │   │   │   │           updateProduct.md
│   │   │   │   │
│   │   │   │   └───promotionCodeController
│   │   │   │           addPromotionCode.md
│   │   │   │           deletePromotionCode.md
│   │   │   │           getPromotionCode.md
│   │   │   │           updatePromotionCode.md
│   │   │   │
│   │   │   └───schemas
│   │   │           promotionCodeSchema.md
│   │   │
│   │   └───user
│   │       │   authStrategies.md
│   │       │   routes.md
│   │       │
│   │       ├───controllers
│   │       │   ├───accountController
│   │       │   │   ├───accountStatusOperations
│   │       │   │   │       deactivateAccount.md
│   │       │   │   │       deleteAccount.md
│   │       │   │   │
│   │       │   │   ├───encryptedPersonalDataOperations
│   │       │   │   │       completeUpdatePersonalData.md
│   │       │   │   │       getPersonalData.md
│   │       │   │   │       initiateUpdatePersonalData.md
│   │       │   │   │
│   │       │   │   ├───mfa
│   │       │   │   │       disableMfa.md
│   │       │   │   │       enableMfa.md
│   │       │   │   │       verifyMfa.md
│   │       │   │   │
│   │       │   │   ├───preferenceManagement
│   │       │   │   │       getPreferences.md
│   │       │   │   │       updatePreferences.md
│   │       │   │   │
│   │       │   │   ├───socialAccountLinking
│   │       │   │   │       linkSocialAccount.md
│   │       │   │   │       unlinkSocialAccount.md
│   │       │   │   │
│   │       │   │   ├───two-FactorAuthentication
│   │       │   │   │       disableTwoFactor.md
│   │       │   │   │       setupTwoFactor.md
│   │       │   │   │
│   │       │   │   └───userProfileOperations
│   │       │   │           getProfile.md
│   │       │   │           updateProfile.md
│   │       │   │
│   │       │   └───authController
│   │       │       ├───login&logout
│   │       │       │       login.md
│   │       │       │       logout.md
│   │       │       │
│   │       │       ├───oAuth
│   │       │       │       oAuthCallback.md
│   │       │       │       oAuthRedirect.md
│   │       │       │
│   │       │       ├───registiration
│   │       │       │       completeRegistration.md
│   │       │       │       register.md
│   │       │       │       resendVerificationCode.md
│   │       │       │
│   │       │       └───resetPassword
│   │       │               requestPasswordReset.md
│   │       │               resetPassword.md
│   │       │               verifyResetCode.md
│   │       │
│   │       └───schemas
│   │               accountSchemas.md
│   │               authSchemas.md
│   │
│   ├───services
│   │       email.md
│   │       logging.md
│   │       risk_assessment.md
│   │
│   └───setup
│           configuration.md
│           docker.md
│
├───logs
│       app.log
│
├───src
│   │   app.js
│   │   server.js
│   │
│   ├───core
│   │   ├───middlewares
│   │   │       errorHandler.js
│   │   │       schemaValidator.js
│   │   │
│   │   ├───security
│   │   │       authorization.js
│   │   │       csrf.js
│   │   │       jwt.js
│   │   │       rateLimiter.js
│   │   │
│   │   └───utilities
│   │           crypto.js
│   │           passwordValidator.js
│   │
│   ├───lib
│   │       redis.js
│   │
│   ├───models
│   │   ├───AuditLog
│   │   │   │   index.js
│   │   │   │
│   │   │   ├───operations
│   │   │   │   ├───adminLog
│   │   │   │   │       createAdminLog.js
│   │   │   │   │       createTimedAdminLog.js
│   │   │   │   │       getAdminLogById.js
│   │   │   │   │       getAdminLogs.js
│   │   │   │   │       updateAdminLog.js
│   │   │   │   │
│   │   │   │   └───auditLog
│   │   │   │           createLog.js
│   │   │   │           getLogs.js
│   │   │   │           purgeOldLogs.js
│   │   │   │
│   │   │   └───schemas
│   │   │           adminLogSchema.js
│   │   │           auditLogSchema.js
│   │   │
│   │   ├───Campaign
│   │   │   │   index.js
│   │   │   │
│   │   │   ├───operations
│   │   │   │       createCampaign.js
│   │   │   │       deleteCampaign.js
│   │   │   │       getActiveCampaigns.js
│   │   │   │       getCampaignById.js
│   │   │   │       getCampaignsList.js
│   │   │   │       updateCampaign.js
│   │   │   │
│   │   │   └───schemas
│   │   │           campaignSchema.js
│   │   │
│   │   ├───KnowledgeBase
│   │   │   │   index.js
│   │   │   │
│   │   │   ├───operations
│   │   │   │   │   updateArticle.js
│   │   │   │   │
│   │   │   │   ├───admin
│   │   │   │   │       bulkDeleteArticles.js
│   │   │   │   │       bulkUpdateArticles.js
│   │   │   │   │       exportAllData.js
│   │   │   │   │       purgeOldVersions.js
│   │   │   │   │       rebuildSearchIndex.js
│   │   │   │   │       restoreDeletedArticle.js
│   │   │   │   │       updateSystemSettings.js
│   │   │   │   │
│   │   │   │   ├───advancedOperations
│   │   │   │   │       getFeaturedArticles.js
│   │   │   │   │       getFrequentlyViewed.js
│   │   │   │   │       getMostHelpful.js
│   │   │   │   │       getPopularArticles.js
│   │   │   │   │       getRecentUpdates.js
│   │   │   │   │
│   │   │   │   ├───article
│   │   │   │   │       createArticle.js
│   │   │   │   │       deleteArticle.js
│   │   │   │   │       getArticle.js
│   │   │   │   │       listArticles.js
│   │   │   │   │       searchArticles.js
│   │   │   │   │       updateArticle.js
│   │   │   │   │
│   │   │   │   ├───attachment
│   │   │   │   │       addAttachment.js
│   │   │   │   │       deleteAttachment.js
│   │   │   │   │       getAttachments.js
│   │   │   │   │
│   │   │   │   ├───category
│   │   │   │   │       createCategory.js
│   │   │   │   │       deleteCategory.js
│   │   │   │   │       getCategory.js
│   │   │   │   │       listCategories.js
│   │   │   │   │       updateCategory.js
│   │   │   │   │
│   │   │   │   ├───feedback
│   │   │   │   │       addFeedback.js
│   │   │   │   │       getFeedback.js
│   │   │   │   │       updateFeedback.js
│   │   │   │   │
│   │   │   │   ├───rating
│   │   │   │   │       addRating.js
│   │   │   │   │       getAverageRating.js
│   │   │   │   │       updateRating.js
│   │   │   │   │
│   │   │   │   └───versioning
│   │   │   │           getArticleHistory.js
│   │   │   │           getVersion.js
│   │   │   │           restoreVersion.js
│   │   │   │
│   │   │   └───schemas
│   │   │           articleSchema.js
│   │   │           categorySchema.js
│   │   │           feedbackSchema.js
│   │   │           ratingSchema.js
│   │   │           updateArticleSchema.js
│   │   │
│   │   ├───Notification
│   │   │   │   index.js
│   │   │   │
│   │   │   ├───operations
│   │   │   │       createNotification.js
│   │   │   │       getUserNotifications.js
│   │   │   │       markAsRead.js
│   │   │   │
│   │   │   └───schemas
│   │   │           notificationSchema.js
│   │   │
│   │   ├───Order
│   │   │   │   index.js
│   │   │   │
│   │   │   ├───operations
│   │   │   │   │   cancelOrder.js
│   │   │   │   │   fetchAdminOrders.js
│   │   │   │   │   getCustomerOrders.js
│   │   │   │   │   getOrder.js
│   │   │   │   │   updateOrderStatus.js
│   │   │   │   │
│   │   │   │   └───createOrder
│   │   │   │           applyPromotionCode.js
│   │   │   │           calculateFinalTotals.js
│   │   │   │           createAndProcessOrder.js
│   │   │   │           createCompleteOrder.js
│   │   │   │           finalizeOrder.js
│   │   │   │           getCartProductsById.js
│   │   │   │           processCartItems.js
│   │   │   │           updateProductStock.js
│   │   │   │           updateUserWithNewOrder.js
│   │   │   │           verifyStockAvailability.js
│   │   │   │
│   │   │   └───schemas
│   │   │           orderSchema.js
│   │   │
│   │   ├───Payment
│   │   │   │   index.js
│   │   │   │
│   │   │   ├───operations
│   │   │   │       createPayment.js
│   │   │   │       findByOrder.js
│   │   │   │       getPayment.js
│   │   │   │       getPayments.js
│   │   │   │       getTotalRevenue.js
│   │   │   │       processRefund.js
│   │   │   │
│   │   │   └───schemas
│   │   │           paymentSchema.js
│   │   │
│   │   ├───Product
│   │   │   │   index.js
│   │   │   │
│   │   │   ├───operations
│   │   │   │   ├───advancedSearch
│   │   │   │   │       getBestSellers.js
│   │   │   │   │       getDiscountedProducts.js
│   │   │   │   │       getFeaturedProducts.js
│   │   │   │   │       getFrequentlyBoughtTogether.js
│   │   │   │   │       getNewArrivals.js
│   │   │   │   │       getProductsByCategory.js
│   │   │   │   │       getRelatedProducts.js
│   │   │   │   │       getSimilarProducts.js
│   │   │   │   │       getTrendingProducts.js
│   │   │   │   │
│   │   │   │   ├───category
│   │   │   │   │       addCategory.js
│   │   │   │   │       deleteCategory.js
│   │   │   │   │       fetchCategories.js
│   │   │   │   │       fetchCategory.js
│   │   │   │   │       initializeRootCategory.js
│   │   │   │   │       updateCategory.js
│   │   │   │   │
│   │   │   │   ├───comment
│   │   │   │   │       addComment.js
│   │   │   │   │       deleteComment.js
│   │   │   │   │       getComment.js
│   │   │   │   │       getComments.js
│   │   │   │   │       updateComment.js
│   │   │   │   │
│   │   │   │   ├───inventoryManagement
│   │   │   │   │       bulkUpdatePrices.js
│   │   │   │   │       bulkUpdateStock.js
│   │   │   │   │       getLowStockProducts.js
│   │   │   │   │       getOutOfStockProducts.js
│   │   │   │   │
│   │   │   │   ├───listing&search
│   │   │   │   │       listProducts.js
│   │   │   │   │       searchProducts.js
│   │   │   │   │
│   │   │   │   ├───mediaManagement
│   │   │   │   │       deleteProductMedia.js
│   │   │   │   │       reorderProductMedia.js
│   │   │   │   │       uploadProductMedia.js
│   │   │   │   │
│   │   │   │   └───product
│   │   │   │           createProduct.js
│   │   │   │           deleteProduct.js
│   │   │   │           getProduct.js
│   │   │   │           updateProduct.js
│   │   │   │
│   │   │   └───schemas
│   │   │           categorySchema.js
│   │   │           commentSchema.js
│   │   │           productSchema.js
│   │   │
│   │   ├───PromotionCode
│   │   │   │   index.js
│   │   │   │
│   │   │   ├───operations
│   │   │   │       createPromotionCode.js
│   │   │   │       deletePromotionCode.js
│   │   │   │       findPromotionCodeById.js
│   │   │   │       findPromotionCodes.js
│   │   │   │       updatePromotionCode.js
│   │   │   │
│   │   │   └───schemas
│   │   │           promotionCodeSchema.js
│   │   │
│   │   ├───ReturnRequest
│   │   │   │   index.js
│   │   │   │
│   │   │   ├───operations
│   │   │   │       createReturnRequest.js
│   │   │   │       deleteReturnRequest.js
│   │   │   │       getReturnRequest.js
│   │   │   │       getReturnRequests.js
│   │   │   │       updateAdminReturnRequest.js
│   │   │   │       updateCustomerReturnRequest.js
│   │   │   │
│   │   │   └───schemas
│   │   │           returnRequestSchema.js
│   │   │
│   │   ├───Ticket
│   │   │   │   index.js
│   │   │   │
│   │   │   ├───operations
│   │   │   │   ├───advancedOperations
│   │   │   │   │       getAssignedTickets.js
│   │   │   │   │       getClosedTickets.js
│   │   │   │   │       getEscalatedTickets.js
│   │   │   │   │       getHighPriorityTickets.js
│   │   │   │   │       getOpenTickets.js
│   │   │   │   │       getPendingTickets.js
│   │   │   │   │       getResolvedTickets.js
│   │   │   │   │       getUserTickets.js
│   │   │   │   │
│   │   │   │   ├───assignment
│   │   │   │   │       assignTicket.js
│   │   │   │   │       reassignTicket.js
│   │   │   │   │       unassignTicket.js
│   │   │   │   │
│   │   │   │   ├───attachment
│   │   │   │   │       addAttachment.js
│   │   │   │   │       deleteAttachment.js
│   │   │   │   │       getAttachments.js
│   │   │   │   │
│   │   │   │   ├───comment
│   │   │   │   │       addComment.js
│   │   │   │   │       deleteComment.js
│   │   │   │   │       getComments.js
│   │   │   │   │       updateComment.js
│   │   │   │   │
│   │   │   │   ├───escalation
│   │   │   │   │       deescalateTicket.js
│   │   │   │   │       escalateTicket.js
│   │   │   │   │
│   │   │   │   ├───statusManagement
│   │   │   │   │       closeTicket.js
│   │   │   │   │       reopenTicket.js
│   │   │   │   │       resolveTicket.js
│   │   │   │   │       updateStatus.js
│   │   │   │   │
│   │   │   │   └───ticket
│   │   │   │           createTicket.js
│   │   │   │           deleteTicket.js
│   │   │   │           getTicket.js
│   │   │   │           listTickets.js
│   │   │   │           moderatorDeleteTicket.js
│   │   │   │           moderatorUpdateTicket.js
│   │   │   │           updateTicket.js
│   │   │   │
│   │   │   └───schemas
│   │   │           attachmentSchema.js
│   │   │           commentSchema.js
│   │   │           ticketSchema.js
│   │   │           updateTicketSchema.js
│   │   │
│   │   └───User
│   │       │   index.js
│   │       │
│   │       ├───operations
│   │       │   ├───admin
│   │       │   │       assignRoles.js
│   │       │   │       getUser.js
│   │       │   │       listUsers.js
│   │       │   │       updateUser.js
│   │       │   │
│   │       │   ├───cart
│   │       │   │       addToCart.js
│   │       │   │       clearCart.js
│   │       │   │       getCartItems.js
│   │       │   │       removeFromCart.js
│   │       │   │       updateCartItem.js
│   │       │   │
│   │       │   ├───other
│   │       │   │       changePassword.js
│   │       │   │       deleteAccount.js
│   │       │   │       findUser.js
│   │       │   │       linkSocialAccount.js
│   │       │   │       register.js
│   │       │   │       unlinkSocialAccount.js
│   │       │   │       updateSensitiveUser.js
│   │       │   │       updateUser.js
│   │       │   │
│   │       │   └───wishlist
│   │       │           addToWishlist.js
│   │       │           getWishlist.js
│   │       │           removeFromWishlist.js
│   │       │
│   │       └───schemas
│   │               userSchema.js
│   │
│   ├───modules
│   │   ├───admin
│   │   │   │   routes.js
│   │   │   │
│   │   │   └───components
│   │   │       ├───commerce-manager
│   │   │       │   │   routes.js
│   │   │       │   │
│   │   │       │   ├───controllers
│   │   │       │   │       campaignController.js
│   │   │       │   │       ordersController.js
│   │   │       │   │       paymentController.js
│   │   │       │   │       promotionController.js
│   │   │       │   │
│   │   │       │   └───schemas
│   │   │       │           campaignSchema.js
│   │   │       │           ordersSchema.js
│   │   │       │
│   │   │       ├───content-manager
│   │   │       │   │   routes.js
│   │   │       │   │
│   │   │       │   ├───controllers
│   │   │       │   │       categoryController.js
│   │   │       │   │       knowledgeBaseController.js
│   │   │       │   │       ticketController.js
│   │   │       │   │
│   │   │       │   └───schemas
│   │   │       │           categorySchema.js
│   │   │       │
│   │   │       └───user-manager
│   │   │           │   routes.js
│   │   │           │   schemas.js
│   │   │           │
│   │   │           ├───controllers
│   │   │           │       controller.js
│   │   │           │
│   │   │           └───services
│   │   │                   accessControl.js
│   │   │                   roleAssignment.js
│   │   │
│   │   ├───core
│   │   │   │   routes.js
│   │   │   │
│   │   │   ├───controllers
│   │   │   │       campaignBaseController.js
│   │   │   │       categoryBaseController.js
│   │   │   │       knowledgeBaseController.js
│   │   │   │       productsBaseController.js
│   │   │   │       ticketController.js
│   │   │   │
│   │   │   ├───schemas
│   │   │   │       productsSchema.js
│   │   │   │
│   │   │   └───services
│   │   │       └───payment
│   │   │           │   PaymentError.js
│   │   │           │   PaymentProcessor.js
│   │   │           │
│   │   │           └───providers
│   │   │                   CODProvider.js
│   │   │                   PayPalProvider.js
│   │   │                   StripeProvider.js
│   │   │
│   │   ├───costumer
│   │   │   │   routes.js
│   │   │   │
│   │   │   ├───controllers
│   │   │   │       commerceController.js
│   │   │   │       ordersController.js
│   │   │   │       returnRequestController.js
│   │   │   │
│   │   │   ├───schemas
│   │   │   │       ordersSchema.js
│   │   │   │       returnRequestSchema.js
│   │   │   │
│   │   │   └───services
│   │   │           service.js
│   │   │
│   │   ├───moderatorSupport
│   │   │   │   routes.js
│   │   │   │
│   │   │   ├───controllers
│   │   │   │       knowledgeBaseController.js
│   │   │   │       ticketController.js
│   │   │   │
│   │   │   └───schemas
│   │   ├───seller
│   │   │   │   routes.js
│   │   │   │
│   │   │   ├───controllers
│   │   │   │       campaignController.js
│   │   │   │       productsController.js
│   │   │   │       promotionCodeController.js
│   │   │   │
│   │   │   └───schemas
│   │   │           promotionCodeSchema.js
│   │   │
│   │   └───user
│   │       │   authStrategies.js
│   │       │   routes.js
│   │       │
│   │       ├───controllers
│   │       │       accountController.js
│   │       │       authController.js
│   │       │
│   │       └───schemas
│   │               accountSchemas.js
│   │               authSchemas.js
│   │
│   └───services
│           cloudinary.js
│           logger.js
│           mailService.js
│           riskCalculator.js
│
└───uploads
    ├───knowledgeBase
    │   └───articles
    │       └───684593a5f3a0720f2476e84d
    │               attachment-1749565745871.txt
    │
    ├───products
    │   └───6858182cb7720b2172849368
    │           media-1750625156644.txt
    │
    └───tickets