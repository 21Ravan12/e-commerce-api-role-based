const moderatorUpdateTicket = async (Ticket, ticketId, userId, updates) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                ...updates,
                updatedAt: new Date(),
                $push: {
                    activityLog: {
                        action: 'updated',
                        by: userId,
                        at: new Date(),
                        details: JSON.stringify(updates)
                    }
                }
            },
            { new: true }
        )
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email');

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        return ticket;
    } catch (error) {
        throw error;
    }
};

module.exports = moderatorUpdateTicket;