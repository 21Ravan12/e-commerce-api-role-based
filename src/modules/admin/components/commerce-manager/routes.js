const express = require('express');
const router = express.Router();
const campaignController = require('./controllers/campaignController');
const orderController = require('./controllers/ordersController');
const promotionCodeController = require('./controllers/promotionController'); 
const paymentController = require('./controllers/paymentController'); 

// ==================== Campaign routes ====================

router.post('/campaign/add', campaignController.addCampaign);

router.put('/campaign/update/:id', campaignController.updateCampaign);

router.delete('/campaign/delete/:id', campaignController.deleteCampaign);

// ==================== Order routes ====================

router.get('/order/get', orderController.getAdminOrders);

router.put('/order/update/:id', orderController.updateOrderStatus);

// ==================== Payment routes ====================

router.get('/payment/get/:id', paymentController.getPayment);

router.get('/payment/get', paymentController.getPayments);

router.get('/payment/find/:orderId', paymentController.findByOrder);

router.get('/payment/get/totalRevenue/:id', paymentController.getTotalRevenue);

// ==================== PromotionCodes routes ====================

router.get('/promotion/get', promotionCodeController.getPromotionCodes);

router.get('/promotion/get/:id', promotionCodeController.getPromotionCode);


module.exports = router;