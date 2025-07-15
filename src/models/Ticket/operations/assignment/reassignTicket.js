const reassignTicket = async (Ticket, ticketId, newAssigneeId, reassignedBy) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                assignedTo: newAssigneeId,
                assignedAt: new Date(),
                updatedAt: new Date(),
                $push: {
                    activityLog: {
                        action: 'reassigned',
                        by: reassignedBy,
                        at: new Date(),
                        details: `Reassigned from previous to user ${newAssigneeId}`
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

module.exports = reassignTicket;