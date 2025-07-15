const unassignTicket = async (Ticket, ticketId, unassignedBy) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                assignedTo: null,
                assignedAt: null,
                updatedAt: new Date(),
                $push: {
                    activityLog: {
                        action: 'unassigned',
                        by: unassignedBy,
                        at: new Date()
                    }
                }
            },
            { new: true }
        )
        .populate('createdBy', 'name email');

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        return ticket;
    } catch (error) {
        throw error;
    }
};


module.exports = unassignTicket;