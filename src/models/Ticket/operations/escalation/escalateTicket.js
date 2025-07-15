const escalateTicket = async (Ticket, ticketId, userId, priority, reason) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                isEscalated: true,
                escalationReason: reason,
                priority: priority, 
                updatedAt: new Date(),
                $push: {
                    activityLog: {
                        action: 'escalated',
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

module.exports = escalateTicket;