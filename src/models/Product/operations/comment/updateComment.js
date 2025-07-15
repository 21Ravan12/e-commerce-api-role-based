async function updateComment(Product, Comment, commentId, userId, updateData) {
  // Find comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  // Check ownership
  if (String(comment.user) !== String(userId)) {
    throw new Error('Not authorized to update this comment');
  }

  // Store old rating for product update
  const oldRating = comment.rating;
  const ratingChanged = updateData.rating && updateData.rating !== oldRating;

  // Update comment
  Object.assign(comment, updateData, { updatedAt: new Date() });
  await comment.save();

  // Update product ratings if rating changed
  if (ratingChanged) {
    const product = await Product.findById(comment.product);
    
    // Update rating distribution
    product.ratingDistribution[oldRating] -= 1;
    product.ratingDistribution[updateData.rating] += 1;
    
    // Recalculate average rating
    const totalRatings = Object.values(product.ratingDistribution).reduce((sum, count) => sum + count, 0);
    const sumRatings = Object.entries(product.ratingDistribution)
      .reduce((sum, [stars, count]) => sum + (parseInt(stars) * count), 0);
    
    product.averageRating = parseFloat((sumRatings / totalRatings).toFixed(1));
    await product.save();
  }

  return {
    id: comment._id,
    commentText: comment.commentText,
    rating: comment.rating,
    updatedAt: comment.updatedAt
  };
}

module.exports = updateComment;