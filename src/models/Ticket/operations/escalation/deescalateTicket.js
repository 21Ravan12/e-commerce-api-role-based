const deescalateTicket = async (Ticket, ticketId, userId, priority, reason) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                isEscalated: false,
                escalationReason: null,
                priority: priority,
                updatedAt: new Date(),
                $push: {
                    activityLog: {
                        action: 'deescalated',
                        by: userId,
                        at: new Date(),
                        details: reason
                    }
                }
            },
            { new: true }
        ).populate('assignedTo', 'name email');

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        return ticket;
    } catch (error) {
        throw error;
    }
};

module.exports = deescalateTicket;