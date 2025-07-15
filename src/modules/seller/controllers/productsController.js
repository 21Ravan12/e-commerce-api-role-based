const RedisClient = require('../../../lib/redis');
const logger = require('../../../services/logger');
const mongoose = require('mongoose');
const Product = require('../../../models/Product');
const AuditLog = require('../../../models/AuditLog/index');
//const { uploadToCloudinary, deleteFromCloudinary } = require('../../../services/storage');

class ProductController {
  constructor() {
    this.redis = RedisClient;
  }

  // Product CRUD Operations
  async createProduct(req, res) {
  try {
    logger.info(`Product creation request from IP: ${req.ip}`);

    // Content type validation
    if (!req.is('application/json')) {
      throw new Error('Content-Type must be application/json');
    }

    const value = req.body;

    // Use the createProduct function for DB operations
    const product = await Product.createProduct({
      ...value,
      seller: req.user._id,
      lastUpdatedBy: req.user._id
    }, req.user);

    // Log the creation
    await AuditLog.createLog({
      action: 'create',
      entity: 'product',
      entityId: product.id,
      userId: req.user._id,
      ip: req.ip,
      event: 'product_created',
      source: 'web',
      userAgent: req.get('User-Agent'),
      metadata: {
        name: product.name,
        categories: value.categories
      }
    });

    await RedisClient.del(`product:${product.id}`);

    // Prepare response
    const response = {
      message: 'Product created successfully',
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        status: product.status
      },
      links: {
        view: `/products/${product.slug}`,
        edit: `/seller/products/${product.id}/edit`
      }
    };

    res
      .set('X-Content-Type-Options', 'nosniff')
      .set('X-Frame-Options', 'DENY')
      .status(201)
      .json(response);

  } catch (error) {
    logger.error(`Product creation error: ${error.message}`, { stack: error.stack });
    
    const statusCode = error.message.includes('Content-Type') ? 415 :
                     error.message.includes('Validation error') ? 400 :
                     error.message.includes('already exists') ? 409 :
                     error.message.includes('not found') ? 404 :
                     error.message.includes('invalid') ? 400 :
                     error.message.includes('Not authorized') ? 403 : 
                     error.statusCode || 500;
    
    res.status(statusCode).json({ 
      error: error.message,
      ...(statusCode === 400 && { details: error.details })
    });
  }
  }

  async getProduct(req, res) {
  try {
    logger.info(`Fetch product request for ID: ${req.params.id} from IP: ${req.ip}`);

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new Error('Invalid product ID');
    }

    // Try cache first
    const cacheKey = `product:${req.params.id}`;
    const cachedProduct = await RedisClient.get(cacheKey);
    
    if (cachedProduct) {
      return res.status(200).json(JSON.parse(cachedProduct));
    }

    // Fetch product using the remake function
    const product = await Product.getProduct(req.params.id, {
      populateRelated: req.query.populateRelated === 'true'
    });

    // Cache the product
    await RedisClient.set(cacheKey, JSON.stringify(product), 'EX', 3600);

    res.status(200).json(product);

  } catch (error) {
    logger.error(`Fetch product error: ${error.message}`, { stack: error.stack });
    
    const statusCode = error.statusCode || 
                      (error.message.includes('Invalid') ? 400 :
                       error.message.includes('not found') ? 404 : 500);
    
    res.status(statusCode).json({ error: error.message });
  }
  }

  async updateProduct(req, res) {
  try {
    logger.info(`Product update request for ID: ${req.params.id} from IP: ${req.ip}`);

    // Content-Type check
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }

    // Validate body
    const value = req.body;

    // Use the logic function
    const { product: updatedProduct, changes } = await Product.updateProduct(
      req.params.id,
      value,
      req.user
    );

    // Create audit log
    await AuditLog.createLog({
      action: 'update',
      entity: 'product',
      entityId: updatedProduct._id,
      userId: req.user._id,
      event: 'product_updated',
      source: 'web',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        changes,
        name: updatedProduct.name
      }
    });

    await RedisClient.del(`product:${updatedProduct._id}`);

    res.status(200).json({
      message: 'Product updated successfully',
      product: {
        id: updatedProduct._id,
        name: updatedProduct.name,
        status: updatedProduct.status
      }
    });

  } catch (error) {
    logger.error(`Product update error: ${error.message}`, { stack: error.stack });

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      ...(statusCode === 400 && { details: error.details })
    });
  }
  }

  async deleteProduct(req, res) {
    try {
      logger.info(`Product deletion request for ID: ${req.params.id} from IP: ${req.ip}`);

      // Check if ID is valid
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid product ID');
      }

      const result = await Product.deleteProduct(req.params.id, req.user);

    // Log deletion
    await AuditLog.createLog({
      action: 'delete',
      entity: 'product',
      entityId: result.id,
      userId: req.user._id,
      event: 'product_deleted',
      source: 'web',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        deletedAt: result.deletedAt
      }
    });

    // Invalidate cache
    await RedisClient.del(`products:${result.id}`);

    res.status(200).json({
      message: 'Product archived successfully',
      productId: result.id,
      timestamp: result.deletedAt
    });

  } catch (error) {
    logger.error(`Product deletion error: ${error.message || 'Unknown error'}`, { stack: error.stack });

    const statusCode = error.statusCode || 
                       (error.message?.includes('Invalid') ? 400 :
                        error.message?.includes('not found') ? 404 :
                        error.message?.includes('Not authorized') ? 403 : 500);

    res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
  }

  // Inventory Management
  async getLowStockProducts(req, res) {
    try {
      logger.info(`Low stock products request from IP: ${req.ip}`);

      const { limit = 50 } = req.query;

      const products = await Product.getLowStockProducts(Number(limit));

      res.status(200).json(products);

    } catch (error) {
      logger.error(`Low stock products error: ${error.message}`, { stack: error.stack });
      
      const statusCode = error.message.includes('Not authorized') ? 403 : 500;
      
      res.status(statusCode).json({ error: error.message });
    }
  }

  async getOutOfStockProducts(req, res) {
    try {
      logger.info(`Out of stock products request from IP: ${req.ip}`);

      const { limit = 50 } = req.query;

      const products = await Product.getOutOfStockProducts({ limit });

      res.status(200).json(products);

    } catch (error) {
      logger.error(`Out of stock products error: ${error.message}`, { stack: error.stack });
      
      const statusCode = error.message.includes('Not authorized') ? 403 : 500;
      
      res.status(statusCode).json({ error: error.message });
    }
  }

  async bulkUpdateStock(req, res) {
    try {
      logger.info(`Bulk stock update request from IP: ${req.ip}`);

      const { updates, increment = true } = req.body;

      if (!updates || !Array.isArray(updates)) {
        throw new Error('Updates array is required');
      }

      const result = await Product.bulkUpdateStock(updates, increment);

      res.status(200).json(result);

    } catch (error) {
      logger.error(`Bulk stock update error: ${error.message}`, { stack: error.stack });
      
      const statusCode = error.message.includes('Not authorized') ? 403 :
                       error.message.includes('Updates array') ? 400 : 500;
      
      res.status(statusCode).json({ error: error.message });
    }
  }

  async bulkUpdatePrices(req, res) {
    try {
      logger.info(`Bulk price update request from IP: ${req.ip}`);

      const { updates } = req.body;

      if (!updates || !Array.isArray(updates)) {
        throw new Error('Updates array is required');
      }

      const result = await Product.bulkUpdatePrices(updates);

      res.status(200).json(result);

    } catch (error) {
      logger.error(`Bulk price update error: ${error.message}`, { stack: error.stack });
      
      const statusCode = error.message.includes('Not authorized') ? 403 :
                       error.message.includes('Updates array') ? 400 : 500;
      
      res.status(statusCode).json({ error: error.message });
    }
  }

  // Media Management
  async uploadProductMedia(req, res) {
    try {
      logger.info(`Product media upload request for ID: ${req.params.id} from IP: ${req.ip}`);

      const result = await Product.uploadProductMedia(req.params.id, req.files, req.user);

      // Log the media upload
      await AuditLog.createLog({
        event: 'product_media_uploaded',
        action: 'update',
        user: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'api',
        entity: 'product',
        entityId: result.productId,
        userId: req.user._id,
        userIp: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          action: 'media_upload',
          count: result.newMedia.length,
          types: [...new Set(result.newMedia.map(m => m.resourceType))]
        }
      });

      res.status(201).json(result.newMedia);

    } catch (error) {
      logger.error(`Product media upload error: ${error.message}`, { stack: error.stack });
      
      const statusCode = error.message.includes('Not authorized') ? 403 :
                       error.message.includes('No files') ? 400 :
                       error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({ error: error.message });
    }
  }

  async deleteProductMedia(req, res) {
    try {
      logger.info(`Product media delete request for ID: ${req.params.id} from IP: ${req.ip}`);

      const result = await Product.deleteProductMedia(req.params.id, req.params.mediaId, req.user);

      // Create audit log with all required fields
      await AuditLog.createLog({
        event: 'product_media_deleted',
        user: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'api',
        action: 'delete',
        entityType: 'product',
        entityId: req.params.id,
        status: 'success',
        metadata: {
          mediaId: req.params.mediaId,
          productId: req.params.id,
          actionDetails: 'Deleted product media'
        }
      });

      res.status(200).json({ message: 'Media removed successfully', result: result });

    } catch (error) {
      logger.error(`Product media delete error: ${error.message}`, { stack: error.stack });
      
      const statusCode = error.message.includes('Not authorized') ? 403 :
                       error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({ error: error.message });
    }
  }

  async reorderProductMedia(req, res) {
    try {
      logger.info(`Product media reorder request for ID: ${req.params.id} from IP: ${req.ip}`);

      const { mediaIds } = req.body;

      const result = await Product.reorderProductMedia(req.params.id, mediaIds, req.user);

      // Log the media reorder
      await AuditLog.createLog({
        action: 'update',
        entity: 'product',
        entityId: result.productId,
        userId: req.user._id,
        ip: req.ip,
        event: 'product_media_reordered',
        source: 'api',
        userAgent: req.get('User-Agent'),
        metadata: {
          action: 'media_reorder',
        }
      });
      
      res.status(200).json(result);

    } catch (error) {
      logger.error(`Product media reorder error: ${error.message}`, { stack: error.stack });
      
      const statusCode = error.message.includes('Not authorized') ? 403 :
                       error.message.includes('mediaIds array') ? 400 :
                       error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({ error: error.message });
    }
  }
}

module.exports = new ProductController();