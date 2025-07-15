const mongoose = require('mongoose');
const campaignSchema = require('./schemas/campaignSchema');

// Register model if not already registered
const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);

// Import operations
const createCampaign = require('./operations/createCampaign');
const getCampaignById = require('./operations/getCampaignById');
const getCampaignsList = require('./operations/getCampaignsList');
const updateCampaign = require('./operations/updateCampaign');
const getActiveCampaigns = require('./operations/getActiveCampaigns');
const deleteCampaign = require('./operations/deleteCampaign');

const createSelfCampaign = require('./operations/selfOperations/createSelfCampaign');
const updateSelfCampaign = require('./operations/selfOperations/updateSelfCampaign');
const deleteSelfCampaign = require('./operations/selfOperations/deleteSelfCampaign');
const getSelfSellerCampaigns = require('./operations/selfOperations/getSelfSellerCampaigns');

// Add query helpers
campaignSchema.query.byStatus = function(status) {
  return this.where({ status });
};

campaignSchema.query.byType = function(type) {
  return this.where({ campaignType: type });
};

campaignSchema.query.activeBetween = function(start, end) {
  return this.where({ 
    startDate: { $lte: end },
    endDate: { $gte: start },
    status: 'active'
  });
};

// Export initialized model and operations
module.exports = {
  Campaign,
  createCampaign: createCampaign.bind(null, Campaign),
  getCampaignById: getCampaignById.bind(null, Campaign),
  getCampaignsList: getCampaignsList.bind(null, Campaign),
  updateCampaign: updateCampaign.bind(null, Campaign),
  getActiveCampaigns: getActiveCampaigns.bind(null, Campaign),
  deleteCampaign: deleteCampaign.bind(null, Campaign),

  createSelfCampaign: createSelfCampaign.bind(null, Campaign),
  updateSelfCampaign: updateSelfCampaign.bind(null, Campaign),
  deleteSelfCampaign: deleteSelfCampaign.bind(null, Campaign),
  getSelfSellerCampaigns: getSelfSellerCampaigns.bind(null, Campaign),
};