const mongoose = require('mongoose');
const { Category, Product } = require('../../../../models/Product');
const { User } = require('../../../../models/User');

async function createSelfCampaign(Campaign, data, userId) {
  // Verify that all product IDs belong to the seller
  if (data.products && data.products.length > 0) {
    const productIds = data.products.map(id => new mongoose.Types.ObjectId(id));
    const sellerProducts = await Product.find({
      _id: { $in: productIds },
      seller: userId
    }).select('_id');

    if (sellerProducts.length !== data.products.length) {
      const foundProductIds = sellerProducts.map(p => p._id.toString());
      const invalidProducts = data.products.filter(id => !foundProductIds.includes(id));
      throw new Error(`Some products do not belong to the seller: ${invalidProducts.join(', ')}`);
    }
  }

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

  // Create campaign data
  const campaignData = {
    ...data,
    seller: userId,
    isSellerCampaign: true,
    createdBy: userId,
    status: 'draft'
  };

  const campaign = new Campaign(campaignData);
  return await campaign.save();
}

module.exports = createSelfCampaign;
