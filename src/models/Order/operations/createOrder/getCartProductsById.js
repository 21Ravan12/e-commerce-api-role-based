const logger = require('../../../../services/logger');
const { Product } = require('../../../Product');

async function getCartProductsById(productIds) {
    try {
      // Convert to plain array of strings if needed
      const ids = productIds.map(id => id.toString ? id.toString() : id);
      
      // Fetch products with all necessary fields for order processing
      const products = await Product.find({ 
        _id: { $in: ids } 
      })
      .select('_id name price stockQuantity categories seller')
      .populate('categories', '_id')
      .populate('seller', '_id username')
      .lean();
  
      if (!products || products.length === 0) {
        throw new Error('No products found for the given IDs');
      }
  
      return products; // Return array of products instead of map
    } catch (error) {
      console.error('Error fetching cart products:', error);
      throw error;
    }
}

module.exports = getCartProductsById;