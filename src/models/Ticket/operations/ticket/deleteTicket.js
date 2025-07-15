const fs = require('fs');
const path = require('path');

const deleteTicket = async (Ticket, Attachment, ticketId, userId) => {
    try {
        // First find the ticket to get its articles/attachments
        const ticket = await Ticket.findOne({
            _id: ticketId,
            createdBy: userId,
        });

        if (!ticket) {
            throw new Error('Ticket not found, not authorized, or cannot be deleted in current state');
        }

        // Find all attachments associated with the ticket
        const attachments = await Attachment.find({ ticket: ticketId });

        // Delete all attachment files from filesystem
        for (const attachment of attachments) {
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
                    console.error(`Error deleting attachment file ${attachment._id}:`, fileError);
                    // Continue even if file deletion fails
                }
            }
        }

        // Delete all attachments from database
        await Attachment.deleteMany({ ticket: ticketId });

        // Finally delete the ticket itself
        const deletedTicket = await Ticket.findOneAndDelete({ 
            _id: ticketId,
            createdBy: userId
        });

        return {
            ticket: deletedTicket,
            deletedAttachments: attachments.length
        };
    } catch (error) {
        throw error;
    }
};

module.exports = deleteTicket;