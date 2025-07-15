const Campaign = require('../../../../../models/Campaign');
const PromotionCode = require('../../../../../models/PromotionCode');
const AuditLog = require('../../../../../models/AuditLog/index');
const logger = require('../../../../../services/logger');
const mongoose = require('mongoose');
const { campaignSchema, campaignUpdateSchema } = require('../schemas/campaignSchema');

class CampaignController {
  
  async addCampaign(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'create_campaign',
        targetModel: 'Campaign',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            contentType: req.headers['content-type']
        }
    });

    try {
        logger.info(`Campaign creation request from IP: ${req.ip}`);

        // Content type validation
        if (!req.is('application/json')) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid content type',
                    contentType: req.headers['content-type']
                }
            });
            return res.status(415).json({ error: 'Content-Type must be application/json' });
        }

        // Validate input against schema
        const { error: validationError, value } = campaignSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            allowUnknown: false
        });

        if (validationError) {
            const errorMessages = validationError.details.map(detail => detail.message).join(', ');
            await complete({
                status: 'failed',
                details: {
                    error: 'Validation error',
                    validationErrors: validationError.details.map(d => ({
                        path: d.path.join('.'),
                        message: d.message,
                        type: d.type
                    })),
                    errorMessages
                }
            });
            return res.status(400).json({ error: `Validation error: ${errorMessages}` });
        }

        // Create the campaign using static method
        const newCampaign = await Campaign.createCampaign(value, req.user._id);

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                campaignId: newCampaign._id,
                campaignName: newCampaign.campaignName,
                campaignType: newCampaign.campaignType,
                status: newCampaign.status,
                startDate: newCampaign.startDate,
                endDate: newCampaign.endDate,
                createdBy: req.user._id
            }
        });

        // Prepare response
        const response = {
            message: 'Campaign created successfully',
            campaign: {
                id: newCampaign._id,
                name: newCampaign.campaignName,
                type: newCampaign.campaignType,
                status: newCampaign.status,
                startDate: newCampaign.startDate,
                endDate: newCampaign.endDate,
                remainingUses: newCampaign.remainingUses,
                minPurchaseAmount: newCampaign.minPurchaseAmount,
                maxDiscountAmount: newCampaign.maxDiscountAmount,
                customerSegments: newCampaign.customerSegments
            },
            links: {
                view: `/campaigns/${newCampaign._id}`,
                edit: `/admin/campaigns/${newCampaign._id}/edit`
            }
        };

        res
            .set('X-Content-Type-Options', 'nosniff')
            .set('X-Frame-Options', 'DENY')
            .status(201)
            .json(response);

    } catch (error) {
        // Determine error type and status code
        const statusCode = error.message.includes('categories are invalid') ? 400 :
                         error.message.includes('products are invalid') ? 400 :
                         error.message.includes('customers are invalid') ? 400 :
                         error.message.includes('customer segment requires') ? 400 : 500;

        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                statusCode,
                errorType: statusCode === 400 ? 'business_validation' : 'server_error'
            }
        });

        logger.error(`Campaign creation error: ${error.message}`, { stack: error.stack });
        
        res.status(statusCode).json({ 
            error: error.message,
            ...(statusCode === 400 && process.env.NODE_ENV === 'development' && { details: error.stack })
        });
    }
  }

  async updateCampaign(req, res) {
    // Create a timed admin log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'update_campaign',
        targetModel: 'Campaign',
        targetId: req.params.id,
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedCampaignId: req.params.id,
            updateData: req.body
        }
    });

    try {
        logger.info(`Update campaign request for ID: ${req.params.id} from IP: ${req.ip}`);

        // Content type validation
        if (!req.is('application/json')) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid content type',
                    contentType: req.headers['content-type']
                }
            });
            return res.status(415).json({ error: 'Content-Type must be application/json' });
        }

        // Validate input
        const { error, value } = campaignUpdateSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            allowUnknown: false
        });

        if (error) {
            const errorMessages = error.details.map(detail => detail.message).join(', ');
            await complete({
                status: 'failed',
                details: {
                    error: 'Validation error',
                    validationErrors: error.details.map(detail => ({
                        path: detail.path.join('.'),
                        message: detail.message,
                        type: detail.type
                    }))
                }
            });
            return res.status(400).json({ error: `Validation error: ${errorMessages}` });
        }

        // Update campaign using static method
        const updatedCampaign = await Campaign.updateCampaign(
            req.params.id, 
            value, 
            req.user._id
        );

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                updatedFields: Object.keys(value),
                campaignData: {
                    id: updatedCampaign._id,
                    name: updatedCampaign.campaignName,
                    type: updatedCampaign.campaignType,
                    status: updatedCampaign.status,
                    startDate: updatedCampaign.startDate,
                    endDate: updatedCampaign.endDate
                }
            }
        });

        // Prepare response
        const response = {
            message: 'Campaign updated successfully',
            campaign: {
                id: updatedCampaign._id,
                name: updatedCampaign.campaignName,
                type: updatedCampaign.campaignType,
                status: updatedCampaign.status,
                startDate: updatedCampaign.startDate,
                endDate: updatedCampaign.endDate,
                remainingUses: updatedCampaign.remainingUses
            },
            links: {
                view: `/campaigns/${updatedCampaign._id}`,
                edit: `/admin/campaigns/${updatedCampaign._id}/edit`
            }
        };

        res
            .set('X-Content-Type-Options', 'nosniff')
            .set('X-Frame-Options', 'DENY')
            .status(200)
            .json(response);

    } catch (error) {
        // Determine error type and status code
        const statusCode = error.message.includes('Content-Type') ? 415 :
                         error.message.includes('Validation') ? 400 :
                         error.message.includes('Invalid') ? 400 :
                         error.message.includes('not found') ? 404 :
                         error.message.includes('categories are invalid') ? 400 :
                         error.message.includes('products are invalid') ? 400 :
                         error.message.includes('customers are invalid') ? 400 :
                         error.message.includes('customer segment requires') ? 400 :
                         error.message.includes('End date must be after') ? 400 :
                         error.message.includes('Max discount amount must be') ? 400 : 500;

        // Complete the admin log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                statusCode: statusCode,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                ...(statusCode === 400 && { validationDetails: error.details })
            }
        });

        logger.error(`Campaign update error: ${error.message}`, { stack: error.stack });
        
        res.status(statusCode).json({ 
            error: error.message,
            ...(statusCode === 400 && { details: process.env.NODE_ENV === 'development' ? error.stack : undefined })
        });
    }
  }

  async deleteCampaign(req, res) {
    // Create a timed admin log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'delete_campaign',
        targetModel: 'Campaign',
        targetId: req.params.id,
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedCampaignId: req.params.id,
            userRole: req.user.role
        }
    });

    try {
        logger.info(`Delete campaign request for ID: ${req.params.id} from IP: ${req.ip}`);

        // Delete campaign using static method
        const deletedCampaign = await Campaign.deleteCampaign(req.params.id);

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                deletedCampaign: {
                    id: deletedCampaign._id,
                    name: deletedCampaign.campaignName,
                    type: deletedCampaign.campaignType,
                    status: deletedCampaign.status,
                    duration: {
                        startDate: deletedCampaign.startDate,
                        endDate: deletedCampaign.endDate
                    }
                },
                associatedPromoCodes: deletedCampaign.associatedPromoCodes || 0
            }
        });

        // Prepare response
        const response = {
            message: 'Campaign deleted successfully',
            deletedCampaign: {
                id: deletedCampaign._id,
                name: deletedCampaign.campaignName,
                type: deletedCampaign.campaignType
            },
            timestamp: new Date().toISOString(),
            links: {
                list: '/campaigns',
                create: '/campaigns'
            }
        };

        res
            .set('X-Content-Type-Options', 'nosniff')
            .set('X-Frame-Options', 'DENY')
            .status(200)
            .json(response);

    } catch (error) {
        // Determine error details
        const statusCode = error.message.includes('Invalid campaign ID') ? 400 :
                         error.message.includes('not found') ? 404 :
                         error.message.includes('associated promotion codes') ? 409 : 500;

        const errorDetails = {
            error: error.message,
            statusCode,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            campaignId: req.params.id
        };

        // Add specific error details
        if (statusCode === 409) {
            errorDetails.associatedPromoCodes = await PromotionCode.countDocuments({ campaign: req.params.id });
            errorDetails.solution = 'Delete or reassign promotion codes first';
        }

        // Complete the admin log with error details
        await complete({
            status: 'failed',
            details: errorDetails
        });

        logger.error(`Delete campaign error: ${error.message}`, { 
            stack: error.stack,
            campaignId: req.params.id,
            userId: req.user?._id 
        });
        
        res.status(statusCode).json({ 
            error: error.message,
            details: statusCode === 409 ? {
                associatedPromoCodes: errorDetails.associatedPromoCodes,
                solution: errorDetails.solution
            } : undefined
        });
    }
  }
}

module.exports = new CampaignController();