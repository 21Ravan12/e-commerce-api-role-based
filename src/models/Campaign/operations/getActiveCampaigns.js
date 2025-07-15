async function getActiveCampaigns(Campaign) {
  const now = new Date();
  return Campaign.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  })
  .populate('validCategories', 'name slug')
  .populate('excludedProducts', 'name sku')
  .lean();
}

module.exports = getActiveCampaigns;