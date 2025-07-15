const mongoose = require('mongoose');

async function getCampaignById(Campaign, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid campaign ID');
  }

  const campaign = await Campaign.findById(id)
    .populate({
      path: 'validCategories',
      select: 'name slug image',
      match: { isActive: true }
    })
    .populate({
      path: 'excludedProducts',
      select: 'name sku price mainImage',
      match: { status: 'active' }
    })
    .populate({
      path: 'createdBy',
      select: 'username email firstName lastName avatar'
    })
    .populate({
      path: 'updatedBy',
      select: 'username email firstName lastName avatar'
    })
    .populate({
      path: 'customCustomers',
      select: 'email firstName lastName phone',
      match: { status: 'active' }
    })
    .populate({
      path: 'promotionCodes',
      select: 'code usageLimit usageCount validFrom validTo isActive',
      match: { isActive: true }
    });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  return campaign;
}

module.exports = getCampaignById;