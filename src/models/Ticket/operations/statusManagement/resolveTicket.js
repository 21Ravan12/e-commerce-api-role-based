const resolveTicket = async (Ticket, ticketId, userId, resolution) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                status: 'resolved',
                resolution,
                updatedAt: new Date(),
                $push: {
                    activityLog: {
                        action: 'resolved',
                        by: userId,
                        at: new Date(),
                        details: resolution
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

module.exports = resolveTicket;