const Campaign = require('../../../models/Campaign');
const Product = require('../../../models/Product');
const AuditLog = require('../../../models/AuditLog/index');
const { sellerCampaignSchema, sellerCampaignUpdateSchema } = require('../schemas/campaignCodeSchema');
const logger = require('../../../services/logger');
const mongoose = require('mongoose');

class SellerCampaignController {
  
  async addSellerSelfCampaign(req, res) {
  try {
    logger.info(`Seller campaign creation request from IP: ${req.ip}`);

    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }

    const { error, value } = sellerCampaignSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({ error: `Validation error: ${errorMessages}` });
    }

    const newCampaign = await Campaign.createSelfCampaign(value, req.user._id);

    await AuditLog.createLog({
      event: 'SELLER_CAMPAIGN_CREATED',
      action: 'create',
      entityType: 'campaign',
      entityId: newCampaign._id,
      user: req.user._id,
      source: 'web',
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
      metadata: {
        campaignName: newCampaign.campaignName,
        campaignType: newCampaign.campaignType,
        status: newCampaign.status,
        productCount: newCampaign.products?.length || 0
      }
    });

    const response = {
      message: 'Seller campaign created successfully',
      campaign: {
        id: newCampaign._id,
        name: newCampaign.campaignName,
        type: newCampaign.campaignType,
        status: newCampaign.status,
        startDate: newCampaign.startDate,
        endDate: newCampaign.endDate,
        discountValue: newCampaign.discountValue,
        productCount: newCampaign.products?.length || 0
      },
      links: {
        view: `/seller/campaigns/${newCampaign._id}`,
        edit: `/seller/campaigns/${newCampaign._id}/edit`
      }
    };

    res
      .set('X-Content-Type-Options', 'nosniff')
      .set('X-Frame-Options', 'DENY')
      .status(201)
      .json(response);

  } catch (error) {
    logger.error(`Seller campaign creation error: ${error.message}`, { stack: error.stack });

    let statusCode = 500;
    if (
      error.message.includes('invalid') ||
      error.message.includes('Validation error') ||
      error.message.includes('requires at least one customer')
    ) {
      statusCode = 400;
    }

    res.status(statusCode).json({ 
      error: error.message,
      ...(process.env.NODE_ENV !== 'production' && statusCode === 400 && { details: error.stack })
    });
  }
  }

  async updateSellerSelfCampaign(req, res) {
    try {
      logger.info(`Update seller campaign request for ID: ${req.params.id} from IP: ${req.ip}`);

      // Content type validation
      if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Content-Type must be application/json' });
      }

      // Validate input
      const { error, value } = sellerCampaignUpdateSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const errorMessages = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({ error: `Validation error: ${errorMessages}` });
      }

      // Update campaign
      const updatedCampaign = await Campaign.updateSelfCampaign(
        req.params.id, 
        value, 
        req.user._id
      );

      // Create audit log
      await AuditLog.createLog({
        event: 'SELLER_CAMPAIGN_UPDATED',
        action: 'update',
        entityType: 'campaign',
        entityId: req.params.id,
        user: req.user._id,
        source: 'web',
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        metadata: {
          newValues: {
            campaignName: updatedCampaign.campaignName,
            status: updatedCampaign.status,
            discountValue: updatedCampaign.discountValue,
            startDate: updatedCampaign.startDate,
            endDate: updatedCampaign.endDate,
            productCount: updatedCampaign.products ? updatedCampaign.products.length : 0
          },
          changedFields: Object.keys(value)
        }
      });

      // Prepare response
      const response = {
        message: 'Seller campaign updated successfully',
        campaign: {
          id: updatedCampaign._id,
          name: updatedCampaign.campaignName,
          type: updatedCampaign.campaignType,
          status: updatedCampaign.status,
          startDate: updatedCampaign.startDate,
          endDate: updatedCampaign.endDate,
          discountValue: updatedCampaign.discountValue,
          productCount: updatedCampaign.products ? updatedCampaign.products.length : 0
        },
        links: {
          view: `/seller/campaigns/${updatedCampaign._id}`,
          edit: `/seller/campaigns/${updatedCampaign._id}/edit`
        }
      };

      res
        .set('X-Content-Type-Options', 'nosniff')
        .set('X-Frame-Options', 'DENY')
        .status(200)
        .json(response);

    } catch (error) {
      logger.error(`Seller campaign update error: ${error.message}`, { stack: error.stack });
      
      const statusCode = error.message.includes('Content-Type') ? 415 :
                       error.message.includes('Validation') ? 400 :
                       error.message.includes('Invalid') ? 400 :
                       error.message.includes('not found') ? 404 :
                       error.message.includes('products are invalid') ? 400 : 500;
      
      res.status(statusCode).json({ 
        error: error.message,
        ...(statusCode === 400 && { details: error.stack })
      });
    }
  }

  async deleteSellerSelfCampaign(req, res) {
    try {
      logger.info(`Delete seller campaign request for ID: ${req.params.id} from IP: ${req.ip}`);

      // Delete campaign
      const deletedCampaign = await Campaign.deleteSelfCampaign(req.params.id, req.user._id);

      // Create audit log
      await AuditLog.createLog({
        event: 'SELLER_CAMPAIGN_DELETED',
        action: 'delete',
        entityType: 'campaign',
        entityId: deletedCampaign._id,
        user: req.user._id,
        source: 'web',
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        metadata: {
          campaignName: deletedCampaign.campaignName,
          campaignType: deletedCampaign.campaignType,
          status: deletedCampaign.status,
          productCount: deletedCampaign.products ? deletedCampaign.products.length : 0
        }
      });

      // Prepare response
      const response = {
        message: 'Seller campaign deleted successfully',
        deletedCampaign: {
          id: deletedCampaign._id,
          name: deletedCampaign.campaignName,
          type: deletedCampaign.campaignType
        },
        timestamp: new Date().toISOString(),
        links: {
          list: '/seller/campaigns',
          create: '/seller/campaigns'
        }
      };

      res
        .set('X-Content-Type-Options', 'nosniff')
        .set('X-Frame-Options', 'DENY')
        .status(200)
        .json(response);

    } catch (error) {
      logger.error(`Delete seller campaign error: ${error.message}`, { 
        stack: error.stack,
        campaignId: req.params.id,
        userId: req.user?._id 
      });
      
      const statusCode = error.message.includes('Invalid campaign ID') ? 400 :
                       error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({ 
        error: error.message,
        details: error.stack
      });
    }
  }

  async getSellerSelfCampaigns(req, res) {
    try {
      const {
        status,
        type,
        active,
        upcoming,
        expired,
        search,
        page = 1,
        limit = 25,
        sort = 'startDate:desc'
      } = req.query;
      const skip = (page - 1) * limit;

      const campaigns = await Campaign.getSelfSellerCampaigns(
        req.user._id,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          skip,
          type,
          active: active === 'true',
          upcoming: upcoming === 'true',
          expired: expired === 'true',
          search,
          status: status ? status : undefined,
          campaignType: type,
          status,
          sort
        }
      );

      res.status(200).json({
        campaigns,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      logger.error(`Get seller campaigns error: ${error.message}`, { stack: error.stack });
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  }
}

module.exports = new SellerCampaignController();