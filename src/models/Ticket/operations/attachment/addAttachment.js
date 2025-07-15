const fs = require('fs');
const path = require('path');

const addAttachment = async (Ticket, Attachment, ticketId, userId, fileData) => {
  let filePath;
  
  try {
    // Validate input
    if (!fileData || !fileData.path || fileData.size === 0) {
      throw new Error('No valid file uploaded');
    }

    // Check if ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Configure upload directory
    const uploadDir = path.join(__dirname, '../../../../../uploads/tickets', ticketId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process file
    const ext = path.extname(fileData.originalname);
    const filename = `attachment-${Date.now()}${ext}`;
    filePath = path.join(uploadDir, filename);

    fs.renameSync(fileData.path, filePath);
    if (fs.statSync(filePath).size === 0) {
      throw new Error('Uploaded file is empty');
    }

    // Create attachment
    const attachment = new Attachment({
      ticket: ticketId,
      uploadedBy: userId,
      filename,
      originalName: fileData.originalname,
      mimeType: fileData.mimetype,
      size: fileData.size,
      path: filePath,
      url: `/uploads/tickets/${ticketId}/${filename}`
    });

    await attachment.save();

    // Update ticket's updatedAt and push attachment reference
    ticket.updatedAt = new Date();
    await ticket.save();

    return {
      success: true,
      data: {
        attachment,
        ticketId: ticket._id,
      },
      message: 'Attachment added successfully'
    };

  } catch (error) {
    // Clean up if file was partially processed
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

module.exports = addAttachment;