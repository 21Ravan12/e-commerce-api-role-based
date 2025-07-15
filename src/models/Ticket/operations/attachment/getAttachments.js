const getAttachments = async (Attachment, ticketId, user, options = {}) => {
  try {
    // Validate input
    if (!ticketId) {
      throw new Error('Ticket ID is required');
    }

    const { page = 1, limit = 10, sort = { uploadedAt: -1 } } = options;
    
    // Optional authorization check (if needed)
    // Example: if (user && !user.canViewAttachments) throw new Error('Not authorized');
    
    // Get paginated attachments
    const attachments = await Attachment.find({ ticket: ticketId })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('uploadedBy', 'name email')
      .lean();

    const total = await Attachment.countDocuments({ ticket: ticketId });

    // Transform attachments if needed (e.g., construct full URLs)
    const transformedAttachments = attachments.map(attachment => ({
      ...attachment,
      // url: `${process.env.BASE_URL || ''}${attachment.path}`,
    }));

    return {
      success: true,
      data: transformedAttachments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  } catch (error) {
    console.error(`Error getting attachments for ticket ${ticketId}:`, error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code || 'ATTACHMENT_FETCH_ERROR'
    };
  }
};

module.exports = getAttachments;