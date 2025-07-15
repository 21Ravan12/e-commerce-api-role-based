const mongoose = require('mongoose');
const { Category } = require('../../../models/Product');
const {Product} = require('../../../models/Product');
const { User } = require('../../../models/User');

async function updateCampaign(Campaign, id, data, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid campaign ID');
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw new Error('Campaign not found');
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
  if (data.customerSegments === 'custom' || 
      (data.customerSegments === undefined && campaign.customerSegments === 'custom' && data.customCustomers)) {
    const customersToCheck = data.customCustomers || campaign.customCustomers;
    if (!customersToCheck?.length) {
      throw new Error('Custom customer segment requires at least one customer');
    }
    
    const validCustomers = await User.countDocuments({ 
      _id: { $in: customersToCheck },
      role: 'customer'
    });
    if (validCustomers !== customersToCheck.length) {
      throw new Error('One or more customers are invalid');
    }
  }

  // Validate dates if being updated
  if (data.startDate || data.endDate) {
    const startDate = data.startDate || campaign.startDate;
    const endDate = data.endDate || campaign.endDate;
    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }
  }

  // Validate maxDiscountAmount for percentage campaigns
  if (data.campaignType === 'percentage' || 
      (data.campaignType === undefined && campaign.campaignType === 'percentage')) {
    if (data.maxDiscountAmount !== undefined && data.maxDiscountAmount <= 0) {
      throw new Error('Max discount amount must be positive for percentage campaigns');
    }
  }

  Object.assign(campaign, data);
  campaign.updatedBy = userId;
  return await campaign.save();
}

module.exports = updateCampaign;