const express = require('express');
const router = express.Router();
const commerceManagerRoutes = require('./components/commerce-manager/routes');
const contentManagerRoutes = require('./components/content-manager/routes');
const userManagerRoutes = require('./components/user-manager/routes');

// 👥 Admin Routes
router.use('/commerce-manager', commerceManagerRoutes);
router.use('/content-manager', contentManagerRoutes);
router.use('/user-manager', userManagerRoutes);

module.exports = router;