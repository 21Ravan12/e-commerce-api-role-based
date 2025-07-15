const express = require('express');
const router = express.Router();
const promotionCodeController = require('./controllers/promotionCodeController');
const productsController = require('./controllers/productsController');
const campaignController = require('./controllers/campaignController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

// ─────────────────────────── 👥 Seller Routes ───────────────────────────

// ───── Promotion CRUD ─────
router.post('/promotion/add', promotionCodeController.addProductBasedPromotionCode);
router.get('/promotion/get/:id', promotionCodeController.getPromotionCode);
router.put('/promotion/update/:id', promotionCodeController.updatePromotionCode);
router.delete('/promotion/delete/:id', promotionCodeController.deletePromotionCode);

// ───── Campaign CRUD ─────
router.post('/campaign/add', campaignController.addSellerSelfCampaign);
router.put('/campaign/update/:id', campaignController.updateSellerSelfCampaign);
router.delete('/campaign/delete/:id', campaignController.deleteSellerSelfCampaign);
router.get('/campaign/get', campaignController.getSellerSelfCampaigns);

// ───── Product CRUD ─────
router.post('/product', productsController.createProduct);
router.get('/product/get/:id', productsController.getProduct);
router.put('/product/:id', productsController.updateProduct);
router.delete('/product/:id', productsController.deleteProduct);

// ───── Inventory ─────
router.get('/product/low-stock', productsController.getLowStockProducts);
router.get('/product/out-of-stock', productsController.getOutOfStockProducts);
router.patch('/product/bulk/stock', productsController.bulkUpdateStock);
router.patch('/product/bulk/prices', productsController.bulkUpdatePrices);

// ───── Media ─────
router.post('/product/:id/media', upload.array('files'), productsController.uploadProductMedia);
router.delete('/product/:id/media/:mediaId', productsController.deleteProductMedia);
router.patch('/product/:id/media/reorder', productsController.reorderProductMedia);

module.exports = router;