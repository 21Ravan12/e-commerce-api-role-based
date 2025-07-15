const fs = require('fs');
const path = require('path');

const deleteAttachment = async (Ticket, Attachment, articleId, attachmentId, userId) => {
  try {
    // Validate input
    if (!attachmentId || !userId) {
      throw new Error('Missing attachment ID or user ID');
    }

    // Find and verify attachment ownership
    const attachment = await Attachment.findOneAndDelete({
      _id: attachmentId,
      uploadedBy: userId
    });

    if (!attachment) {
      throw new Error('Attachment not found or not authorized');
    }

    // Delete file from filesystem if path exists
    if (attachment.path) {
      try {
        const filePath = path.resolve(attachment.path);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          
          // Optional: Remove empty parent directory
          const dirPath = path.dirname(filePath);
          if (fs.existsSync(dirPath) && fs.readdirSync(dirPath).length === 0) {
            fs.rmdirSync(dirPath);
          }
        }
      } catch (fileError) {
        console.error('Error deleting attachment file:', fileError);
        // Continue even if file deletion fails (the DB record is already deleted)
      }
    }

    // Update ticket's metadata
    const updatedTicket = await Ticket.findByIdAndUpdate(
      attachment.ticket,
      { 
        updatedAt: new Date(),
        lastUpdatedBy: userId 
      },
      { new: true }
    );

    if (!updatedTicket) {
      console.warn(`Ticket ${attachment.ticket} not found after attachment deletion`);
    }

    return {
      success: true,
      data: {
        ticketId: attachment.ticket,
        attachmentId: attachment._id,
        deletedAt: new Date()
      },
      message: 'Attachment deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting attachment:', error);
    throw error;
  }
};

module.exports = deleteAttachment;