const createTicket = async (Ticket, ticketData, userId) => {
    try {
        const ticket = new Ticket({
            ...ticketData,
            createdBy: userId,
            $push: {
                activityLog: {
                    action: 'created',
                    by: userId,
                    at: new Date()
                }
            }
        });

        await ticket.save();
        return ticket.populate('createdBy', 'name email');
    } catch (error) {
        throw error;
    }
};

module.exports = createTicket;