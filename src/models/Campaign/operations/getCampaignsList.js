async function getCampaignsList(Campaign, {
  page = 1,
  limit = 25,
  status,
  type,
  active,
  upcoming,
  expired,
  search,
  sort = 'startDate:desc'
}) {
  const skip = (page - 1) * limit;
  const filter = {};
  const now = new Date();
  
  // Status Filter
  const validStatuses = ['draft', 'active', 'paused', 'completed', 'archived'];
  if (validStatuses.includes(status)) {
    filter.status = status;
  }

  // Type Filter
  const validTypes = ['fixed', 'percentage', 'free_shipping', 'bundle', 'buy_x_get_y'];
  if (validTypes.includes(type)) {
    filter.campaignType = type;
  }

  // Date-Based Filters
  if (active === 'true') {
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
    filter.status = 'active';
  } else if (upcoming === 'true') {
    filter.startDate = { $gt: now };
    filter.status = 'draft';
  } else if (expired === 'true') {
    filter.endDate = { $lt: now };
    filter.status = { $ne: 'archived' };
  }

  // Search Filter
  if (search) {
    filter.campaignName = {
      $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i'
    };
  }

  // Configure Sorting
  const sortOptions = {};
  const [sortField, direction] = sort.split(':');
  
  const validSortFields = ['startDate', 'endDate', 'createdAt', 'campaignName'];
  if (validSortFields.includes(sortField)) {
    sortOptions[sortField] = direction === 'asc' ? 1 : -1;
  }

  const [campaigns, total] = await Promise.all([
    Campaign.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('validCategories', 'name slug')
      .populate('createdBy', 'username email')
      .lean({ virtuals: true }),
    
    Campaign.countDocuments(filter)
  ]);

  return {
    campaigns,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
}

module.exports = getCampaignsList;