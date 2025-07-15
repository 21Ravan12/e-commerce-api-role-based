const Campaign = require('../../../models/Campaign');
const logger = require('../../../services/logger');

class CampaignController {

  async getCampaign(req, res) {
    try {
      logger.info(`Get campaign request for ID: ${req.params.id} from IP: ${req.ip}`);

      // Get campaign using static method
      const campaign = await Campaign.getCampaignById(req.params.id);

      // Prepare response data
      const responseData = {
        id: campaign._id,
        campaignName: campaign.campaignName,
        campaignType: campaign.campaignType,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        isActive: campaign.isActive,
        campaignAmount: campaign.campaignAmount,
        usageLimit: campaign.usageLimit,
        usageCount: campaign.usageCount,
        minPurchaseAmount: campaign.minPurchaseAmount,
        maxDiscountAmount: campaign.maxDiscountAmount,
        customerSegments: campaign.customerSegments,
        landingPageURL: campaign.landingPageURL,
        bannerImage: campaign.bannerImage,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        validCategories: campaign.validCategories,
        excludedProducts: campaign.excludedProducts,
        customCustomers: campaign.customCustomers,
        promotionCodes: campaign.promotionCodes,
        createdBy: campaign.createdBy,
        updatedBy: campaign.updatedBy
      };

      // Add conditional fields
      if (campaign.campaignType === 'percentage') {
        responseData.maxDiscountAmount = campaign.maxDiscountAmount;
      }

      res
        .set('X-Content-Type-Options', 'nosniff')
        .set('X-Frame-Options', 'DENY')
        .status(200)
        .json(responseData);

    } catch (error) {
      const errorMessage = error.message || 'Failed to retrieve campaign';
      const errorDetails = process.env.NODE_ENV === 'development' ? 
          { stack: error.stack, fullError: error } : undefined;

      logger.error(`Get campaign error: ${errorMessage}`, {
        campaignId: req.params.id,
        error: errorDetails
      });

      const statusCode = error.message.includes('Invalid campaign ID') ? 400 :
                       error.message.includes('not found') ? 404 : 500;

      res.status(statusCode).json({
        error: errorMessage,
        ...(errorDetails && { debug: errorDetails })
      });
    }
  }

  async getCampaigns(req, res) {
    try {
      // Log the request with user context
      logger.info('Campaign list request', {
        user: req.user?.id,
        query: req.query,
        ip: req.ip
      });

      // Get campaigns using static method
      const { campaigns, total, page, pages } = await Campaign.getCampaignsList({
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
        type: req.query.type,
        active: req.query.active,
        upcoming: req.query.upcoming,
        expired: req.query.expired,
        search: req.query.search,
        sort: req.query.sort
      });

      // Prepare response
      const response = {
        meta: {
          success: true,
          count: campaigns.length,
          total,
          page,
          pages,
          filters: Object.keys(req.query).length > 0 ? req.query : undefined
        },
        data: campaigns.map(campaign => ({
          id: campaign._id,
          name: campaign.campaignName,
          type: campaign.campaignType,
          status: campaign.status,
          isActive: campaign.isActive,
          dates: {
            start: campaign.startDate,
            end: campaign.endDate
          },
          usage: {
            limit: campaign.usageLimit,
            remaining: campaign.remainingUses,
            count: campaign.usageCount
          },
          restrictions: {
            minPurchase: campaign.minPurchaseAmount,
            maxDiscount: campaign.maxDiscountAmount,
            categories: campaign.validCategories,
            excludedProducts: campaign.excludedProducts?.length || 0
          },
          audience: {
            segment: campaign.customerSegments,
            customCustomers: campaign.customCustomers?.length || 0
          },
          assets: {
            banner: campaign.bannerImage,
            landingPage: campaign.landingPageURL
          },
          createdBy: campaign.createdBy,
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt
        }))
      };

      // Send response
      res.status(200)
        .set('X-Total-Count', total)
        .json(response);

    } catch (error) {
      // Enhanced error handling
      const errorResponse = {
        meta: {
          success: false,
          error: 'campaign_fetch_failed',
          message: 'Failed to retrieve campaigns'
        },
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      };

      logger.error('Campaign fetch error', {
        error: error.message,
        query: req.query,
        user: req.user?.id
      });

      res.status(500).json(errorResponse);
    }
  }
}

module.exports = new CampaignController();