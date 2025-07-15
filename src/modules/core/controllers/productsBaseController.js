const RedisClient = require('../../../lib/redis');
const logger = require('../../../services/logger');
const { productSchema, productUpdateSchema } = require('../schemas/productsSchema');
const mongoose = require('mongoose');
const {
  Product,
  listProducts,
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
  getRelatedProducts,
  getSimilarProducts,
  getFrequentlyBoughtTogether,
  getTrendingProducts,
  getNewArrivals,
  getBestSellers,
  getDiscountedProducts,
  addComment,
  getComments,
  getComment,
  updateComment,
  deleteComment

} = require('../../../models/Product');
const AuditLog = require('../../../models/AuditLog/index');
//const { uploadToCloudinary, deleteFromCloudinary } = require('../../../services/storage');

class ProductController {
  constructor() {
    this.redis = RedisClient;
  }

  // Product Listing & Search
  async listProducts(req, res) {
  try {
    logger.info(`List products request from IP: ${req.ip}`);

    const {
      page = 1,
      limit = 25,
      sort = '-createdAt',
      fields,
      populate = 'categories',
      ...rawFilters
    } = req.query;

    // Build filters and exclude archived products
    const filter = {
      ...rawFilters,
      status: { $ne: 'archived' }
    };

    // Prepare sort object
    const sortObj = {};
    sort.split(',').forEach(field => {
      const direction = field.startsWith('-') ? -1 : 1;
      const key = field.replace(/^-/, '');
      sortObj[key] = direction;
    });

    // Build cache key
    const cacheKey = `products:list:${JSON.stringify(req.query)}`;
    const cached = await RedisClient.get(cacheKey);
    if (!cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // Fetch from database using the utility function
    const result = await listProducts({
      filter,
      sort: sortObj,
      page: Number(page),
      limit: Number(limit),
      populate,
      skip: (page - 1) * limit
    });

    // Field limiting (manual trimming if needed)
    if (fields) {
      const selected = fields.split(',');
      result.products = result.products.map(product => {
        const trimmed = {};
        selected.forEach(field => {
          if (product.hasOwnProperty(field)) {
            trimmed[field] = product[field];
          }
        });
        return trimmed;
      });
    }

    // Cache the response
    await RedisClient.set(cacheKey, JSON.stringify(result), 'EX', 600);

    res.status(200).json(result);
  } catch (error) {
    logger.error(`List products error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: error.message });
  }
  }

  async searchProducts(req, res) {
  try {
    logger.info(`Product search request from IP: ${req.ip}`);

    const {
      q: query,
      page = 1,
      limit = 25,
      sort = '-createdAt',
      minPrice,
      maxPrice,
      category,
      brand,
      ...otherFilters
    } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Build cache key
    const cacheKey = `products:search:${JSON.stringify(req.query)}`;
    const cachedResults = await RedisClient.get(cacheKey);

    if (cachedResults) {
      return res.status(200).json(JSON.parse(cachedResults));
    }

    // Build filters
    const filters = { ...otherFilters };

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    if (category) {
      filters.categories = category;
    }

    if (brand) {
      filters.brand = brand;
    }

    // Build options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    };

    // Execute reusable search function
    const result = await searchProducts(query, filters, options);

    const response = {
      products: result.products,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    };

    // Cache the response
    await RedisClient.set(cacheKey, JSON.stringify(response), 'EX', 600);

    res.status(200).json(response);

  } catch (error) {
    logger.error(`Product search error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: error.message });
  }
  }

  // Product Relationships
  async getProductsByCategory(req, res) {
  try {
    logger.info(`Products by category request for ID: ${req.params.categoryId} from IP: ${req.ip}`);

    const categoryId = req.params.categoryId;
    const { limit = 50, sort = '-isFeatured -createdAt' } = req.query;

    // Build cache key
    const cacheKey = `product:category:${categoryId}:${limit}:${sort}`;
    const cached = await RedisClient.get(cacheKey);

    if (cached) { 
      return res.status(200).json(JSON.parse(cached));
    }

    // Call logic function
    const products = await getProductsByCategory(categoryId, {
      limit: parseInt(limit),
      sort
    });

    // Cache result
    await RedisClient.set(cacheKey, JSON.stringify(products), 'EX', 1800); // 30 mins

    res.status(200).json(products);
  } catch (error) {
    logger.error(`Products by category error: ${error.message}`, { stack: error.stack });

    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
  }

  async getRelatedProducts(req, res) {
  try {
    logger.info(`Related products request for ID: ${req.params.productId} from IP: ${req.ip}`);

    const productId = req.params.productId;
    const { limit = 5 } = req.query;

    // Use logic function
    const relatedProducts = await getRelatedProducts(productId, { limit: parseInt(limit) });

    res.status(200).json(relatedProducts);

  } catch (error) {
    logger.error(`Related products error: ${error.message}`, { stack: error.stack });

    const statusCode = error.statusCode || (error.message.includes('not found') ? 404 : 500);

    res.status(statusCode).json({ error: error.message });
  }
  }

  // Special Product Groups
  async getFeaturedProducts(req, res) {
  try {
    logger.info(`Featured products request from IP: ${req.ip}`);

    const limit = parseInt(req.query.limit, 10) || 10;

    const cacheKey = `products:featured:${limit}`;
    const cachedProducts = await RedisClient.get(cacheKey);

    if (cachedProducts) {
      return res.status(200).json(JSON.parse(cachedProducts));
    }
    
    // Use the logic function
    const products = await getFeaturedProducts(Product, { limit });

    // Cache the result
    await RedisClient.set(cacheKey, JSON.stringify(products), 'EX', 3600);

    res.status(200).json(products);
  } catch (error) {
    logger.error(`Featured products error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: error.message });
  }
  }  

  async getNewArrivals(req, res) {
  try {
    logger.info(`New arrivals request from IP: ${req.ip}`);

    const options = {
      limit: parseInt(req.query.limit) || 10,
      days: parseInt(req.query.days) || 30
    };

    const products = await getNewArrivals(Product, options);

    res.status(200).json(products);

  } catch (error) {
    logger.error(`New arrivals error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: error.message });
  }
  }

  async getBestSellers(req, res) {
  try {
    logger.info(`Best sellers request from IP: ${req.ip}`);

    const limit = parseInt(req.query.limit, 10) || 10;
    const days = req.query.days ? parseInt(req.query.days, 10) : undefined;

    const products = await getBestSellers(Product, { limit, days });

    res.status(200).json(products);

  } catch (error) {
    logger.error(`Best sellers error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: error.message });
  }
  }

  async getDiscountedProducts(req, res) {
  try {
    logger.info(`Discounted products request from IP: ${req.ip}`);

    const { limit = 10 } = req.query;

    const products = await getDiscountedProducts({ limit: Number(limit) });

    res.status(200).json(products);

  } catch (error) {
    logger.error(`Discounted products error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: error.message });
  }
  }

  async getTrendingProducts(req, res) {
    try {
      logger.info(`Trending products request from IP: ${req.ip}`);

      const { limit = 10, days = 7 } = req.query;

      const products = await getTrendingProducts({ limit, days });

      res.status(200).json(products);

    } catch (error) {
      logger.error(`Trending products error: ${error.message}`, { stack: error.stack });
      res.status(500).json({ error: error.message });
    }
  }

  // Comments Management
  async addComment(req, res) {
  try {
    logger.info(`Add comment request for Product ID: ${req.params.id} from IP: ${req.ip}`);
    
    const productId = req.params.id;
    const { commentText, rating } = req.body;
    const user = req.user;

    if (!commentText || !rating || commentText.trim().length === 0) {
      throw new Error('Comment text cannot be empty');
    }

    const result = await addComment(productId, user._id, {
      commentText,
      rating,
      user: user._id
    });

    await AuditLog.createLog({
      event: 'comment_added',
      action: 'create',
      entity: 'comment',
      entityId: result._id,
      userId: user._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { productId, commentText, rating }
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error(`Add comment error: ${error.message}`, { stack: error.stack });

    const statusCode = error.message.includes('empty') ? 400 :
                       error.message.includes('not found') ? 404 : 500;

    res.status(statusCode).json({ error: error.message });
  }
  }

  async getComments(req, res) {
  try {
    logger.info(`Get comments request for Product ID: ${req.params.id} from IP: ${req.ip}`);

    const productId = req.params.id;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const comments = await getComments(productId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    });

    res.status(200).json({
      comments
    });

  } catch (error) {
    logger.error(`Get comments error: ${error.message}`, { stack: error.stack });

    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
  }

  async getComment(req, res) {
  try {
    logger.info(`Get comment by ID: ${req.params.reviewId} from IP: ${req.ip}`);

    const commentId = req.params.reviewId;

    const comment = await getComment(commentId);

    res.status(200).json(comment);
  } catch (error) {
    logger.error(`Get comment error: ${error.message}`, { stack: error.stack });

    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
  }

  async updateComment(req, res) {
  try {
    logger.info(`Update comment request for ID: ${req.params.reviewId} from IP: ${req.ip}`);
    
    const { commentText } = req.body;
    const commentId = req.params.reviewId;
    const user = req.user;

    if (!commentText || commentText.trim().length === 0) {
      throw new Error('Comment text cannot be empty');
    }

    const comment = await updateComment(commentId, user._id, {
      commentText,
      user: user._id
    });

    await AuditLog.createLog({
      event: 'comment_updated',
      ip: req.ip,
      action: 'update',
      entity: 'comment',
      entityId: comment._id,
      userId: user._id,
      userIp: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { commentText }
    });

    res.status(200).json(comment);
  } catch (error) {
    logger.error(`Update comment error: ${error.message}`, { stack: error.stack });

    const statusCode = error.message.includes('empty') ? 400 :
                       error.message.includes('not authorized') ? 403 :
                       error.message.includes('not found') ? 404 : 500;

    res.status(statusCode).json({ error: error.message });
  }
  }

  async deleteComment(req, res) {
  try {
    logger.info(`Delete comment request for ID: ${req.params.reviewId} from IP: ${req.ip}`);

    const user = req.user;
    const commentId = req.params.reviewId;
    
    const comment = await deleteComment(commentId, user._id);

    await AuditLog.createLog({
      event: 'comment_deleted',
      ip: req.ip,
      action: 'delete',
      entity: 'comment',
      entityId: comment._id,
      userId: user._id,
      userIp: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json(comment);
  } catch (error) {
    logger.error(`Delete comment error: ${error.message}`, { stack: error.stack });

    const statusCode = error.message.includes('not authorized') ? 403 :
                       error.message.includes('not found') ? 404 : 500;

    res.status(statusCode).json({ error: error.message });
  }
  }

  // Add these methods to the ProductController class
  async getSimilarProducts(req, res) {
  try {
    logger.info(`Similar products request for ID: ${req.params.productId} from IP: ${req.ip}`);

    const productId = req.params.productId;
    const { limit = 5 } = req.query;

    // Build cache key
    const cacheKey = `products:similar:${productId}:${limit}`;
    const cachedProducts = await RedisClient.get(cacheKey);
    
    if (cachedProducts) {
      return res.status(200).json(JSON.parse(cachedProducts));
    }

    const similarProducts = await getSimilarProducts(productId, { limit });

    // Cache results
    await RedisClient.set(cacheKey, JSON.stringify(similarProducts), 'EX', 1800); // 30 minutes cache

    res.status(200).json(similarProducts);

  } catch (error) {
    logger.error(`Similar products error: ${error.message}`, { stack: error.stack });
    
    const statusCode = error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({ error: error.message });
  }
  }

  async getFrequentlyBoughtTogether(req, res) {
  try {
    logger.info(`Frequently bought together request for ID: ${req.params.productId} from IP: ${req.ip}`);

    const productId = req.params.productId;
    const { limit = 5 } = req.query;

    // Build cache key
    const cacheKey = `products:fbt:${productId}:${limit}`;
    const cachedProducts = await RedisClient.get(cacheKey);
    
    if (cachedProducts) {
      return res.status(200).json(JSON.parse(cachedProducts));
    }

    const products = await getFrequentlyBoughtTogether(productId, { limit });

    // Cache results
    await RedisClient.set(cacheKey, JSON.stringify(products), 'EX', 3600); // 1 hour cache

    res.status(200).json(products);

  } catch (error) {
    logger.error(`Frequently bought together error: ${error.message}`, { stack: error.stack });
    
    const statusCode = error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({ error: error.message });
  }
  }
}

module.exports = new ProductController();