async function addComment(Product, Comment, productId, userId, commentData) {
  const comment = await Comment.findOne({ product: productId, user: userId });
  if (comment) {
    throw new Error('User has already commented on this product');
  }
  // Create new comment
  const newComment = new Comment({
    product: productId,
    user: userId,
    ...commentData
  });

  // Save comment
  await newComment.save();

  // Update product's comment count and rating
  await Product.findByIdAndUpdate(productId, {
    $push: { comments: newComment._id },
    $inc: { 
      reviewCount: 1,
      ratingCount: 1,
      [`ratingDistribution.${commentData.rating}`]: 1 
    }
  });

  // Recalculate average rating
  const product = await Product.findById(productId);
  const totalRatings = Object.values(product.ratingDistribution).reduce((sum, count) => sum + count, 0);
  const sumRatings = Object.entries(product.ratingDistribution)
    .reduce((sum, [stars, count]) => sum + (parseInt(stars) * count), 0);
  
  product.averageRating = parseFloat((sumRatings / totalRatings).toFixed(1));
  await product.save();

  return {
    id: newComment._id,
    product: productId,
    user: userId,
    commentText: newComment.commentText,
    rating: newComment.rating,
    createdAt: newComment.createdAt
  };
}

module.exports = addComment;