const updateRating = async (Rating, ratingId, newRatingValue) => {
    try {
      const rating = await Rating.findByIdAndUpdate(
        ratingId,
        { 
          rating: newRatingValue,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!rating) {
        return {
          success: false,
          error: 'Rating not found'
        };
      }

      return {
        success: true,
        data: rating,
        message: 'Rating updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = updateRating;