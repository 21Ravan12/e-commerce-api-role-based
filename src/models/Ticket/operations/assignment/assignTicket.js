const assignTicket = async (Ticket, ticketId, assigneeId, assignedBy) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                assignedTo: assigneeId,
                assignedAt: new Date(),
                updatedAt: new Date(),
                $push: {
                    activityLog: {
                        action: 'assigned',
                        by: assignedBy,
                        at: new Date(),
                        details: `Assigned to user ${assigneeId}`
                    }
                }
            },
            { new: true }
        )
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        return ticket;
    } catch (error) {
        throw error;
    }
};

module.exports = assignTicket;