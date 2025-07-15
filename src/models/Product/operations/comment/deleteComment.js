async function deleteComment(Product, Comment, commentId, userId, isAdmin = false) {
  try {
    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check ownership or admin status
    if (!isAdmin && String(comment.user) !== String(userId)) {
      throw new Error('Not authorized to delete this comment');
    }

    // Remove comment reference from product
    await Product.findByIdAndUpdate(comment.product, {
      $pull: { comments: commentId },
      $inc: { 
        reviewCount: -1,
        ratingCount: -1,
        [`ratingDistribution.${comment.rating}`]: -1 
      }
    });

    // Recalculate average rating for product
    const product = await Product.findById(comment.product);
    const totalRatings = Object.values(product.ratingDistribution).reduce((sum, count) => sum + count, 0);
    
    if (totalRatings > 0) {
      const sumRatings = Object.entries(product.ratingDistribution)
        .reduce((sum, [stars, count]) => sum + (parseInt(stars) * count), 0);
      product.averageRating = parseFloat((sumRatings / totalRatings).toFixed(1));
    } else {
      product.averageRating = 0;
    }
    
    await product.save();

    // Delete comment - using deleteOne() instead of remove()
    await Comment.deleteOne({ _id: commentId });

    return {
      id: commentId,
      deleted: true,
      timestamp: new Date(),
      productId: comment.product,
      rating: comment.rating
    };
  } catch (error) {
    console.error('Error in deleteComment:', error);
    throw error; // Re-throw for controller to handle
  }
}

module.exports = deleteComment;