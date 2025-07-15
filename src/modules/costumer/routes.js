const express = require('express');
const router = express.Router();
const CommerceController = require('./controllers/commerceController');
const returnRequestController = require('./controllers/returnRequestController');
const orderController = require('./controllers/ordersController');

// ==================== ORDER ROUTES ====================

router.post('/order/add', orderController.createOrder);

router.get('/order/get', orderController.getOrders);

router.get('/order/get/:orderId', orderController.getOrderDetails);

router.put('/order/cancel/:id', orderController.cancelOrder);

// ==================== ReturnRequest ROUTES ====================

router.post('/returnRequest/add', returnRequestController.createReturnRequest);

router.get('/returnRequest/get', returnRequestController.getReturnRequests);

router.get('/returnRequest/get/:id', returnRequestController.getReturnRequest);

router.put('/returnRequest/update/:id', returnRequestController.updateReturnRequest);

router.put('/returnRequest/archive/:id', returnRequestController.archiveReturnRequest);

// ==================== COMMERCE ROUTES ====================

// ───── Wishlist CRUD ─────
router.post('/commerce/wishlist/add', CommerceController.addToWishlist);

router.delete('/commerce/wishlist/:productId', CommerceController.removeFromWishlist);

router.get('/commerce/wishlist/get', CommerceController.getWishlist);

// ───── Cart CRUD ─────
router.post('/commerce/cart/add', CommerceController.addToCart);

router.patch('/commerce/cart/update/:itemId', CommerceController.updateCartItem);

router.delete('/commerce/cart/remove/:itemId', CommerceController.removeFromCart);

router.delete('/commerce/cart/clear', CommerceController.clearCart);

router.get('/commerce/cart/get', CommerceController.getCart);


module.exports = router;