const mongoose = require('mongoose');

async function deleteCampaign(Campaign, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid campaign ID');
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  await Campaign.deleteOne({ _id: campaign._id });
  return campaign;
}

module.exports = deleteCampaign;