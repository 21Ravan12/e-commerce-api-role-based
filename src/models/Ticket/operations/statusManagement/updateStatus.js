const updateStatus = async (Ticket, ticketId, userId, newStatus, notes) => {
    try {
        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Invalid status');
        }

        const updateData = { 
            status: newStatus,
            updatedAt: new Date(),
            $push: {
                activityLog: {
                    action: 'status_change',
                    by: userId,
                    at: new Date(),
                    details: `Changed to ${newStatus}`,
                    notes
                }
            }
        };

        if (newStatus === 'closed') {
            updateData.closedAt = new Date();
            updateData.closedBy = userId;
        } else if (newStatus === 'resolved') {
            updateData.resolvedAt = new Date();
        }

        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            updateData,
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

module.exports = updateStatus;