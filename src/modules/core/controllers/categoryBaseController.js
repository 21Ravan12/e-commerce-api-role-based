const mongoose = require('mongoose');
const logger = require('../../../services/logger');
const Category = require('../../../models/Product');
const RedisClient = require('../../../lib/redis');

class CategoryController {
  constructor() {
    this.redis = RedisClient;
  }

  async fetchCategory(req, res) {
    try {
      logger.info(`Fetch category request for ID: ${req.params.id} from IP: ${req.ip}`);

      // Check if ID is valid
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Invalid category ID');
      }

      // Use static method to fetch category
      const categoryData = await Category.fetchCategory(req.params.id, {
        admin: req.query.admin === 'true',
        includeChildren: req.query.include === 'children'
      });

      res.status(200).json(categoryData);

    } catch (error) {
      logger.error(`Fetch category error: ${error.message}`, { stack: error.stack });
      
      const statusCode = error.message.includes('Invalid') ? 400 :
                       error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({ error: error.message });
    }
  }

  async fetchCategories(req, res) {
    try {
      logger.info(`Fetch all categories request from IP: ${req.ip}`);

      // Use static method to fetch categories
      const categoriesData = await Category.fetchCategories({
        admin: req.query.admin === 'true',
        includeChildren: req.query.include === 'children',
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

      res.status(200).json(categoriesData);

    } catch (error) {
      logger.error(`Fetch all categories error: ${error.message}`, { stack: error.stack });
      
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({ error: error.message });
    }
  }
}

module.exports = new CategoryController();