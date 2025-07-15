const closeTicket = async (Ticket, ticketId, userId) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                status: 'closed',
                closedAt: new Date(),
                closedBy: userId,
                updatedAt: new Date(),
                $push: {
                    activityLog: {
                        action: 'closed',
                        by: userId,
                        at: new Date()
                    }
                }
            },
            { new: true }
        )
        .populate('closedBy', 'name email')
        .populate('assignedTo', 'name email');

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        return ticket;
    } catch (error) {
        throw error;
    }
};

module.exports = closeTicket;