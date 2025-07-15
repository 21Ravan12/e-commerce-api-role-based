const mongoose = require('mongoose');
const { Category, Product } = require('../../../../models/Product');
const { User } = require('../../../../models/User');

async function updateSelfCampaign(Campaign, id, data, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid campaign ID');
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  // Verify valid categories
  if (data.validCategories?.length > 0) {
    const validCategories = await Category.countDocuments({ 
      _id: { $in: data.validCategories } 
    });
    if (validCategories !== data.validCategories.length) {
      throw new Error('One or more categories are invalid');
    }
  }

  // Verify excluded products
  if (data.excludedProducts?.length > 0) {
    const validProducts = await Product.countDocuments({ 
      _id: { $in: data.excludedProducts } 
    });
    if (validProducts !== data.excludedProducts.length) {
      throw new Error('One or more excluded products are invalid');
    }
  }

  // Verify custom customers
  const segmentIsCustom = data.customerSegments === 'custom' ||
    (data.customerSegments === undefined && campaign.customerSegments === 'custom');

  if (segmentIsCustom) {
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

  // Validate date range
  if (data.startDate || data.endDate) {
    const startDate = new Date(data.startDate || campaign.startDate);
    const endDate = new Date(data.endDate || campaign.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }

    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }
  }

  // Validate discount amount for percentage
  const campaignType = data.campaignType || campaign.campaignType;
  if (campaignType === 'percentage' && data.maxDiscountAmount !== undefined) {
    if (data.maxDiscountAmount <= 0) {
      throw new Error('Max discount amount must be positive for percentage campaigns');
    }
  }

  Object.assign(campaign, data);
  campaign.updatedBy = userId;
  return await campaign.save();
}

module.exports = updateSelfCampaign;
