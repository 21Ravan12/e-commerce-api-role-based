const mongoose = require('mongoose');

async function deleteSelfCampaign(Campaign, campaignId, userId) {
  if (!mongoose.Types.ObjectId.isValid(campaignId)) {
    throw new Error('Invalid campaign ID');
  }

  // Fetch campaign and check ownership
  const campaign = await Campaign.findOne({ _id: campaignId, createdBy: userId });

  if (!campaign) {
    throw new Error('Campaign not found or does not belong to you');
  }

  // Optional: Check if campaign is deletable (not active, expired, etc.)
  if (campaign.status === 'active') {
    throw new Error('Active campaigns cannot be deleted');
  }

  await Campaign.deleteOne({ _id: campaign._id });

  return campaign;
}

module.exports = deleteSelfCampaign;