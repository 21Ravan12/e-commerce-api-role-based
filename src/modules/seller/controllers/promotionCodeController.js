const PromotionCode = require('../../../models/PromotionCode');
const AuditLog = require('../../../models/AuditLog/index');
const logger = require('../../../services/logger');
const mongoose = require('mongoose');
const RedisClient = require('../../../lib/redis');
const { promotionCodeSchema, promotionCodeUpdateSchema, promotionCodeGetSchema } = require('../schemas/promotionCodeSchema');

class PromotionCodeController {
  constructor() {
    this.redis = RedisClient;
  }

  async addProductBasedPromotionCode(req, res) {
  try {
    logger.info(`Product-based promotion creation request from IP: ${req.ip}`);

    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }

    const { error, value } = promotionCodeSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorMessages = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ error: `Validation error: ${errorMessages}` });
    }

    const newPromotionCode = await PromotionCode.createProductBasedPromotionCode(
      {
        ...value,
        createdBy: req.user._id,
        userRole: req.user.role
      }
    );

    await AuditLog.createLog({
      event: 'PRODUCT_PROMOTION_CREATED',
      action: 'create',
      entityType: 'promotion_code',
      entityId: newPromotionCode._id,
      user: req.user._id,
      source: 'web',
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
      metadata: {
        code: newPromotionCode.promotionCode,
        type: newPromotionCode.promotionType,
        status: newPromotionCode.status,
        applicableProducts: newPromotionCode.applicableProducts || []
      }
    });

    const response = {
      message: 'Product-based promotion code created successfully',
      promotionCode: newPromotionCode.toObject(),
      links: {
        view: `/promotion-codes/${newPromotionCode._id}`,
        edit: req.user.role === 'admin'
          ? `/admin/promotion-codes/${newPromotionCode._id}/edit`
          : `/seller/promotion-codes/${newPromotionCode._id}/edit`
      }
    };

    res
      .set('X-Content-Type-Options', 'nosniff')
      .set('X-Frame-Options', 'DENY')
      .status(201)
      .json(response);

  } catch (error) {
    logger.error(`Product-based promotion creation error: ${error.message}`, { stack: error.stack });

    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed', details: Object.values(error.errors).map(e => e.message) });
    }

    if (error.message === 'Promotion code already exists') {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
  }

  async getPromotionCode(req, res) {
    try {
      logger.info(`Get promotion code request for ID: ${req.params.id} from IP: ${req.ip}`);
  
      const promotionCode = await PromotionCode.findPromotionCodeById(req.params.id);
  
      if (!promotionCode) {
        return res.status(404).json({ error: 'Promotion code not found' });
      }
  
      // Add virtual properties 
      const now = new Date();
      const isActive = promotionCode.status === 'active' && 
                      now >= new Date(promotionCode.startDate) && 
                      now <= new Date(promotionCode.endDate);
  
      const response = {
        promotionCode: {
          ...promotionCode,
          isActive,
          remainingUses: promotionCode.usageLimit ? promotionCode.usageLimit - promotionCode.usageCount : null,
          createdBy: promotionCode.createdBy ? (promotionCode.userRole || 'admin') : 'admin'
        },
        links: {
          list: req.user.role === 'admin' ? '/admin/promotion-codes' : '/seller/promotion-codes',
          edit: req.user.role === 'admin' 
            ? `/admin/promotion-codes/${promotionCode._id}/edit` 
            : `/seller/promotion-codes/${promotionCode._id}/edit`
        }
      };
  
      res
        .set('X-Content-Type-Options', 'nosniff')
        .set('X-Frame-Options', 'DENY')
        .status(200)
        .json(response);
  
    } catch (error) {
      logger.error(`Get promotion code error: ${error.message}`, { 
        stack: error.stack,
        promotionCodeId: req.params.id 
      });
      
      if (error.message === 'Invalid promotion code ID format') {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  async updatePromotionCode(req, res) {
    try {
      logger.info(`Promotion code update request for ID: ${req.params.id} from IP: ${req.ip}`);

      // Content type validation
      if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Content-Type must be application/json' });
      }

      // Validate input against Joi schema
      const { error, value } = promotionCodeUpdateSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const errorMessages = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({ 
          error: `Validation error: ${errorMessages}`,
          details: error.details 
        });
      }

      // Update promotion code using static method
      const updatedPromotionCode = await PromotionCode.updatePromotionCode(req.params.id, value);

      // Create audit log
      await AuditLog.createLog({
        event: 'PROMOTION_CODE_UPDATED',
        action: 'update',
        entityType: 'promotion_code',
        entityId: updatedPromotionCode._id,
        user: req.user._id,
        source: 'web',
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        metadata: {
          code: updatedPromotionCode.promotionCode,
          type: updatedPromotionCode.promotionType,
          status: updatedPromotionCode.status,
          amount: updatedPromotionCode.promotionAmount,
          userRole: req.user.role,
          applicableProducts: updatedPromotionCode.applicableProducts || []
        }
      });

      // Prepare response
      const response = {
        message: "Promotion code updated successfully",
        promotionCode: updatedPromotionCode,
        links: {
          view: `/promotion-codes/${updatedPromotionCode._id}`,
          edit: req.user.role === 'admin' 
            ? `/admin/promotion-codes/${updatedPromotionCode._id}/edit` 
            : `/seller/promotion-codes/${updatedPromotionCode._id}/edit`
        }
      };

      res
        .set('X-Content-Type-Options', 'nosniff')
        .set('X-Frame-Options', 'DENY')
        .status(200)
        .json(response);

    } catch (error) {
      logger.error(`Promotion code update error: ${error.message}`, { stack: error.stack });
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors
        });
      }

      // Handle specific error messages
      if (error.message === 'Invalid promotion code ID format' || 
          error.message === 'Promotion code not found') {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  async deletePromotionCode(req, res) {
    try {
      logger.info(`Promotion code deletion request for ID: ${req.params.id} from IP: ${req.ip}`);

      // Delete promotion code using static method
      const deletedCode = await PromotionCode.deletePromotionCode(req.params.id);

      // Create audit log
      await AuditLog.createLog({
        event: 'PROMOTION_CODE_DELETED',
        action: 'delete',
        entityType: 'promotion_code',
        entityId: deletedCode.id,
        user: req.user._id,
        source: 'web',
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        metadata: {
          code: deletedCode.code,
          type: deletedCode.type,
          userRole: req.user.role
        }
      });

      const response = {
        message: "Promotion code deleted successfully",
        deletedCode: {
          ...deletedCode,
          createdBy: req.user.role === 'seller' ? 'seller' : 'admin'
        },
        timestamp: new Date().toISOString(),
        links: {
          list: req.user.role === 'admin' ? '/admin/promotion-codes' : '/seller/promotion-codes',
          create: req.user.role === 'admin' ? '/admin/promotion-codes/create' : '/seller/promotion-codes/create'
        }
      };

      res
        .set('X-Content-Type-Options', 'nosniff')
        .set('X-Frame-Options', 'DENY')
        .status(200)
        .json(response);

    } catch (error) {
      logger.error(`Promotion code deletion error: ${error.message}`, { stack: error.stack });
      
      // Handle specific error messages
      if (error.message === 'Invalid promotion code ID format') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Promotion code not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Cannot delete promotion code that has been used') {
        return res.status(409).json({ 
          error: error.message,
          usageCount: error.usageCount
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
      });
    }
  }
  // Helper method to validate seller products
  async validateSellerProducts(sellerId, productIds) {
    // In a real implementation, this would query your database to verify
    // that all productIds belong to the seller with sellerId
    // For now, we'll return an empty array (assuming all are valid)
    return [];
    
    // Example implementation might look like:
    // const invalidProducts = await Product.find({
    //   _id: { $in: productIds },
    //   seller: { $ne: sellerId }
    // }).select('_id');
    // return invalidProducts.map(p => p._id.toString());
  }
}

module.exports = new PromotionCodeController();