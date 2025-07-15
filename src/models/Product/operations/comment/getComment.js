const mongoose = require('mongoose');

async function getComment(Comment, commentId) {
  try {
    // Validate commentId format first
    if (!mongoose.isValidObjectId(commentId)) {
      throw new Error('Invalid comment ID format');
    }

    const comment = await Comment.findById(commentId)
      .populate('user', 'username avatar')
      .populate('product', 'name slug')
      .lean(); // Convert to plain JS object to prevent circular references

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Clean up the response
    const { _id, __v, ...rest } = comment;
    return { id: _id, ...rest };
  } catch (error) {
    console.error('Error in getComment:', error);
    throw error; // Re-throw for controller to handle
  }
}

module.exports = getComment;