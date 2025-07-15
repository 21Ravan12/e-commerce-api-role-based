const bcrypt = require('bcryptjs');
const RedisClient = require('../../../../../lib/redis');
const logger = require('../../../../../services/logger');
const { categorySchema, updateSchema } = require('../schemas/categorySchema');
const mongoose = require('mongoose');
const Category = require('../../../../../models/Product');
const AuditLog = require('../../../../../models/AuditLog/index');

class CategoryController {
  constructor() {
    this.redis = RedisClient;
  }

  async addCategory(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'add_category',
        targetModel: 'Category',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestContentType: req.get('Content-Type'),
            requestBody: req.body
        }
    });

    try {
        logger.info(`Category creation request from IP: ${req.ip}`);

        // Content type validation
        if (!req.is('application/json')) {
            const error = new Error('Content-Type must be application/json');
            await complete({
                status: 'failed',
                details: {
                    error: error.message,
                    contentType: req.get('Content-Type'),
                    validationError: true
                }
            });
            throw error;
        }

        const { error, value } = categorySchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            allowUnknown: false
        });

        if (error) {
            const errorMessages = error.details.map(detail => detail.message).join(', ');
            const validationError = new Error(`Validation error: ${errorMessages}`);
            await complete({
                status: 'failed',
                details: {
                    error: validationError.message,
                    validationDetails: error.details.map(d => ({
                        path: d.path,
                        message: d.message,
                        type: d.type
                    })),
                    validationError: true
                }
            });
            throw validationError;
        }

        // Use static method to add category
        const { category, auditLogData } = await Category.addCategory(
            value,
            req.user,
            req.ip,
            req.get('User-Agent')
        );

        // Log the creation in audit log
        await AuditLog.createLog(auditLogData);

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                createdCategory: {
                    id: category._id,
                    name: category.name,
                    slug: category.slug,
                    parentCategory: category.parentCategory,
                    isActive: category.isActive
                },
                auditLogId: auditLogData._id || auditLogData.logId
            }
        });

        // Prepare response
        const response = {
            message: 'Category created successfully',
            category: {
                id: category._id,
                name: category.name,
                slug: category.slug,
                parentCategory: category.parentCategory,
                isActive: category.isActive
            },
            links: {
                view: `/categories/${category.slug}`,
                edit: `/admin/categories/${category._id}/edit`
            }
        };

        res
            .set('X-Content-Type-Options', 'nosniff')
            .set('X-Frame-Options', 'DENY')
            .status(201)
            .json(response);

    } catch (error) {
        // Prepare error details for logging
        const statusCode = error.message.includes('Content-Type') ? 415 :
                         error.message.includes('Validation error') ? 400 :
                         error.message.includes('already exists') ? 409 :
                         error.message.includes('not found') ? 404 :
                         error.message.includes('invalid') ? 400 : 500;

        const errorDetails = {
            error: error.message,
            statusCode,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };

        // Add specific error type details
        if (error.details) {
            errorDetails.validationDetails = error.details;
        }

        // Complete the log with error details
        await complete({
            status: 'failed',
            details: errorDetails
        });

        logger.error(`Category creation error: ${error.message}`, { stack: error.stack });
        
        res.status(statusCode).json({ 
            error: error.message,
            ...(statusCode === 400 && { details: error.details }),
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
  }

  async updateCategory(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'update_category',
        targetModel: 'Category',
        targetId: req.params.id,
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedCategoryId: req.params.id,
            updateData: req.body // Note: Consider redacting sensitive fields if any
        }
    });

    try {
        logger.info(`Category update request for ID: ${req.params.id} from IP: ${req.ip}`);

        // Content type validation
        if (!req.is('application/json')) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Content-Type must be application/json',
                    contentType: req.get('Content-Type'),
                    validationError: true
                }
            });
            throw new Error('Content-Type must be application/json');
        }

        const { error, value } = updateSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessages = error.details.map(detail => detail.message).join(', ');
            await complete({
                status: 'failed',
                details: {
                    error: `Validation error: ${errorMessages}`,
                    validationErrors: error.details.map(detail => ({
                        path: detail.path,
                        message: detail.message,
                        type: detail.type
                    })),
                    validationError: true
                }
            });
            throw new Error(`Validation error: ${errorMessages}`);
        }

        // Use static method to update category
        const { category: updatedCategory, auditLogData } = await Category.updateCategory(
            req.params.id,
            value,
            req.user,
            req.ip,
            req.get('User-Agent')
        );

        // Log the update in both AuditLog and AdminLog
        await Promise.all([
            AuditLog.createLog(auditLogData),
            complete({
                status: 'success',
                details: {
                    updatedFields: Object.keys(value),
                    finalCategoryData: {
                        id: updatedCategory._id,
                        name: updatedCategory.name,
                        slug: updatedCategory.slug,
                        isActive: updatedCategory.isActive
                    },
                    auditLogReference: auditLogData._id // If available
                }
            })
        ]);

        res.status(200).json({
            message: 'Category updated successfully',
            category: {
                id: updatedCategory._id,
                name: updatedCategory.name,
                slug: updatedCategory.slug,
                isActive: updatedCategory.isActive
            }
        });

    } catch (error) {
        // Prepare error details for logging
        const errorDetails = {
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };

        // Determine status code and add specific details
        const statusCode = error.message.includes('Content-Type') ? 415 :
                         error.message.includes('Validation error') ? 400 :
                         error.message.includes('not found') ? 404 :
                         error.message.includes('already exists') ? 409 :
                         error.message.includes('invalid') ? 400 : 500;

        if (statusCode === 400) {
            errorDetails.validationError = true;
        } else if (statusCode === 404) {
            errorDetails.notFound = true;
        } else if (statusCode === 409) {
            errorDetails.conflict = true;
        }

        // Complete the log with error details
        await complete({
            status: 'failed',
            details: errorDetails
        });

        logger.error(`Category update error: ${error.message}`, { stack: error.stack });
        
        res.status(statusCode).json({ 
            error: error.message,
            ...(statusCode === 400 && { details: error.details }),
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
  }  

  async deleteCategory(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'delete_category',
        targetModel: 'Category',
        targetId: req.params.id,
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedCategoryId: req.params.id
        }
    });

    try {
        logger.info(`Delete category request for ID: ${req.params.id} from IP: ${req.ip}`);

        // Check if ID is valid
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid category ID',
                    validationError: true
                }
            });
            throw new Error('Invalid category ID');
        }

        // Use static method to delete category
        const { deletedId, auditLogData } = await Category.deleteCategory(
            req.params.id,
            req.user,
            req.ip,
            req.get('User-Agent')
        );

        // Log the deletion in AuditLog
        await AuditLog.createLog(auditLogData);

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                deletedId: deletedId,
                auditLogReference: auditLogData._id || auditLogData.logId,
                timestamp: new Date().toISOString()
            }
        });

        res.status(200).json({
            message: 'Category deleted successfully',
            deletedId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Determine error type for logging
        const errorType = error.message.includes('Invalid') ? 'validation' :
                         error.message.includes('not found') ? 'not_found' :
                         error.message.includes('Cannot delete') ? 'conflict' : 'server_error';

        // Complete the admin log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                errorType: errorType,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });

        logger.error(`Delete category error: ${error.message}`, { stack: error.stack });
        
        const statusCode = error.message.includes('Invalid') ? 400 :
                          error.message.includes('not found') ? 404 :
                          error.message.includes('Cannot delete') ? 409 : 500;
        
        res.status(statusCode).json({ 
            error: error.message,
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }
}

module.exports = new CategoryController();