const updateFeedback = async (Feedback, feedbackId, updateData, adminId) => {
    try {
      const feedback = await Feedback.findById(feedbackId);
      
      if (!feedback) {
        return {
          success: false,
          error: 'Feedback not found'
        };
      }

      // Add admin response if provided
      if (updateData.adminResponse) {
        feedback.adminResponse = {
          text: updateData.adminResponse,
          respondedBy: adminId,
          respondedAt: new Date()
        };
      }

      // Update status if provided
      if (updateData.status) {
        feedback.status = updateData.status;
      }

      await feedback.save();

      return {
        success: true,
        data: feedback,
        message: 'Feedback updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = updateFeedback;