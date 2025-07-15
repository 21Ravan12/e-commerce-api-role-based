const express = require('express');
const router = express.Router();
const controller = require('./controllers/controller');
const { validateAccess, RESOURCES, PERMISSIONS } = require('./services/accessControl');

// User management routes
router.get('/', validateAccess(RESOURCES.USER, PERMISSIONS.MANAGE), controller.listUsers);

router.get('/:id', validateAccess(RESOURCES.USER, PERMISSIONS.VIEW), controller.getUser);

router.put('/:id', validateAccess(RESOURCES.USER, PERMISSIONS.EDIT), controller.updateUserStatus);

router.delete('/:id', validateAccess(RESOURCES.USER, PERMISSIONS.DELETE), controller.deleteUser);

// Role management routes (admin only)
router.post('/:id/roles', validateAccess(RESOURCES.USER, PERMISSIONS.MANAGE), controller.assignRoles);

module.exports = router;