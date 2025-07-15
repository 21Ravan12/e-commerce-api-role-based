const getTicket = async (Ticket, ticketId) => {
    try {
        const ticket = await Ticket.findById(ticketId)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('closedBy', 'name email');

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        return ticket;
    } catch (error) {
        throw error;
    }
};

module.exports = getTicket;