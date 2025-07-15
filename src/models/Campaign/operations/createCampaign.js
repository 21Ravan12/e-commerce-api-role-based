const { Category } = require('../../../models/Product');
const {Product} = require('../../../models/Product');
const { User } = require('../../../models/User');

async function createCampaign(Campaign, data, userId) {
  // Verify valid categories if provided
  if (data.validCategories?.length > 0) {
    const validCategories = await Category.countDocuments({ 
      _id: { $in: data.validCategories } 
    });
    if (validCategories !== data.validCategories.length) {
      throw new Error('One or more categories are invalid');
    }
  }

  // Verify excluded products if provided
  if (data.excludedProducts?.length > 0) {
    const validProducts = await Product.countDocuments({ 
      _id: { $in: data.excludedProducts } 
    });
    if (validProducts !== data.excludedProducts.length) {
      throw new Error('One or more excluded products are invalid');
    }
  }

  // Verify custom customers if provided
  if (data.customerSegments === 'custom') {
    if (!data.customCustomers?.length) {
      throw new Error('Custom customer segment requires at least one customer');
    }
    
    const validCustomers = await User.countDocuments({ 
      _id: { $in: data.customCustomers },
      role: 'customer'
    });
    if (validCustomers !== data.customCustomers.length) {
      throw new Error('One or more customers are invalid');
    }
  }

  const campaign = new Campaign({
    ...data,
    createdBy: userId,
    status: 'draft'
  });

  return await campaign.save();
}

module.exports = createCampaign;