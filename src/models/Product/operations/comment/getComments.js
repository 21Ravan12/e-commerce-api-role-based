const mongoose = require('mongoose');

async function getComments(Comment, productId, { page = 1, limit = 10, sort = '-createdAt' } = {}) {
  const skip = (page - 1) * limit;
  
  // Proper ObjectId creation
  const productObjectId = new mongoose.Types.ObjectId(productId);

  const [comments, total] = await Promise.all([
    Comment.find({ product: productObjectId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('user', 'username avatar')
      .lean(),
    Comment.countDocuments({ product: productObjectId })
  ]);

  return {
    comments,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

module.exports = getComments;