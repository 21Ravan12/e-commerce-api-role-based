const reopenTicket = async (Ticket, ticketId, userId, reason) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                status: 'open',
                closedAt: null,
                closedBy: null,
                updatedAt: new Date(),
                $push: {
                    activityLog: {
                        action: 'reopened',
                        by: userId,
                        at: new Date(),
                        details: reason
                    }
                }
            },
            { new: true }
        )
        .populate('assignedTo', 'name email');

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        return ticket;
    } catch (error) {
        throw error;
    }
};

module.exports = reopenTicket;