const User = require('../../../../../models/User');
const { encrypt, decrypt } = require('../../../../../core/utilities/crypto');
const { assignRoles } = require('../services/roleAssignment');
const { validateAccess } = require('../services/accessControl');
const AdminLog = require('../../../../../models/AuditLog');
const logger = require('../../../../../services/logger');
const mongoose = require('mongoose');

class UserManagerController {

  async listUsers(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AdminLog.createTimedAdminLog({
        action: 'list_users',
        targetModel: 'User',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            filters: req.query,
            pagination: {
                requestedPage: req.query.page,
                requestedLimit: req.query.limit
            }
        }
    });

    try {
        const { page = 1, limit = 10, status, ...otherFilters } = req.query;
        
        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

        const result = await User.listUsers({
            status,
            ...otherFilters,
            page: pageNumber,
            limit: limitNumber
        });

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                finalPagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limitNumber)
                },
                returnedCount: result.users.length,
                appliedFilters: otherFilters,
                statusFilter: status
            }
        });

        res.json({
            success: true,
            data: result.users,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: result.total,
                totalPages: Math.ceil(result.total / limitNumber)
            }
        });

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        logger.error(`User list error: ${error.message}`, error.stack);
        res.status(500).json({ 
            success: false, 
            error: 'Could not retrieve users',
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }

  async getUser(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AdminLog.createTimedAdminLog({
        action: 'get_user',
        targetModel: 'User',
        targetId: req.params.id,
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedUserId: req.params.id
        }
    });

    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            // Complete the log with validation error
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid user ID',
                    validationError: true
                }
            });
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }

        const user = await User.getUser(id);

        if (!user) {
            // Complete the log with not found error
            await complete({
                status: 'failed',
                details: {
                    error: 'User not found',
                    notFound: true
                }
            });
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Only allow admins or the user themselves to access
        if (req.user._id.toString() !== id && !req.user.roles.includes('admin')) {
            // Complete the log with unauthorized access attempt
            await complete({
                status: 'failed',
                details: {
                    error: 'Unauthorized access attempt',
                    unauthorized: true,
                    requesterId: req.user._id.toString(),
                    requesterRoles: req.user.roles
                }
            });
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                userData: {
                    id: user._id,
                    email: user.email,
                    roles: user.roles,
                    status: user.status
                }
            }
        });

        res.json({ success: true, data: user });
    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        logger.error(`Get user error: ${error.message}`, error.stack);
        res.status(500).json({ 
            success: false, 
            error: 'Server error',
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }

  async deleteUser(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AdminLog.createTimedAdminLog({
        action: 'delete_user',
        targetModel: 'User',
        targetId: req.params.id,
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedUserId: req.params.id,
            deletionReason: req.params.reason,
            deletionType: 'soft_delete' // Explicitly stating this is a soft delete
        }
    });

    try {
        const { id, reason } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            // Complete the log with validation error
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid user ID',
                    validationError: true
                }
            });
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }

        // Soft delete
        const deletedUser = await User.deleteAccount(id, reason);

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                deletionResult: {
                    userId: deletedUser._id,
                    email: deletedUser.email,
                    newStatus: deletedUser.status,
                    deletionTimestamp: deletedUser.deletedAt,
                    deletionReason: deletedUser.deletionReason
                }
            }
        });

        res.json({ 
            success: true, 
            message: 'User marked as deleted',
            data: {
                id: deletedUser._id,
                email: deletedUser.email,
                status: deletedUser.status,
                deletedAt: deletedUser.deletedAt
            }
        });

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                attemptedDeletion: {
                    userId: req.params.id,
                    reason: req.params.reason
                }
            }
        });

        logger.error(`Delete user error: ${error.message}`, error.stack);
        res.status(500).json({ 
            success: false, 
            error: 'Server error during user deletion',
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  } 

  async updateUserStatus(req, res) {
    const { logEntry, complete } = await AdminLog.createTimedAdminLog({
        action: 'update_user_status',
        targetModel: 'User',
        targetId: req.params.id,
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedUserId: req.params.id,
            statusUpdate: req.body.status
        }
    });

    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            await complete({
                status: 'failed',
                details: { error: 'Invalid user ID' }
            });
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }

        if (!status || !['active', 'suspended', 'banned'].includes(status)) {
            await complete({
                status: 'failed',
                details: { error: 'Invalid status value' }
            });
            return res.status(400).json({ success: false, error: 'Invalid status value' });
        }

        // Only allow admins to update status
        if (!req.user.roles.includes('admin')) {
            await complete({
                status: 'failed',
                details: { error: 'Unauthorized - Admin role required' }
            });
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const updatedUser = await User.updateUserStatus(
            id,
            status
        );

        if (!updatedUser) {
            await complete({
                status: 'failed',
                details: { error: 'User not found' }
            });
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await complete({
            status: 'success',
            details: { newStatus: updatedUser.status }
        });

        res.json({
            success: true,
            message: 'User status updated successfully',
            data: { status: updatedUser.status }
        });

    } catch (error) {
        await complete({
            status: 'failed',
            details: { error: error.message }
        });

        res.status(500).json({ 
            success: false, 
            error: 'Server error'
        });
    }
  }

  async assignRoles(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AdminLog.createTimedAdminLog({
        action: 'assign_roles',
        targetModel: 'User',
        targetId: req.params.id,
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedUserId: req.params.id,
            requestedRoles: req.body.roles,
            requesterRoles: req.user.roles // Log who is attempting this action
        }
    });

    try {
        const { id } = req.params;
        const { roles } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid user ID',
                    validationError: true
                }
            });
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }

        // Validate roles input
        if (!roles || !Array.isArray(roles) || roles.length === 0) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid roles format',
                    validationError: true,
                    receivedRoles: roles
                }
            });
            return res.status(400).json({ 
                success: false, 
                error: 'Roles must be a non-empty array' 
            });
        }

        // Check if requester has permission to assign these roles
        const forbiddenRoles = roles.filter(role => 
            !req.user.roles.includes('super-admin') && 
            ['admin', 'super-admin'].includes(role)
        );

        if (forbiddenRoles.length > 0) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Insufficient privileges for role assignment',
                    unauthorized: true,
                    attemptedRoles: forbiddenRoles,
                    allowedRoles: req.user.roles
                }
            });
            return res.status(403).json({ 
                success: false, 
                error: `You cannot assign these roles: ${forbiddenRoles.join(', ')}` 
            });
        }

        const result = await assignRoles(id, roles);

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                previousRoles: result.previousRoles, // Assuming assignRoles returns previous state
                newRoles: result.roles,
                changes: result.changes // Could include added/removed roles
            }
        });

        res.json({
            success: true,
            message: 'Roles updated successfully',
            data: result
        });

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                errorType: error.name,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                ...(error.code && { errorCode: error.code })
            }
        });

        logger.error(`Role assignment error: ${error.message}`, { 
            error,
            targetUser: req.params.id,
            attemptedRoles: req.body.roles 
        });

        // Handle specific error cases
        if (error.name === 'UserNotFoundError') {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        if (error.name === 'InvalidRoleError') {
            return res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }

        res.status(500).json({ 
            success: false, 
            error: 'Failed to assign roles',
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }  
}

module.exports = new UserManagerController();