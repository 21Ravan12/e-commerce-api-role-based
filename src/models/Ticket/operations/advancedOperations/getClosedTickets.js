const getClosedTickets = async (Ticket, options = {}, query = {}) => {
    try {
        const { page = 1, limit = 10, sort = { closedAt: -1 } } = options;
        const filter = { 
            status: 'closed',
            ...query 
        };

        const tickets = await Ticket.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('closedBy', 'name email')
            .lean();

        const total = await Ticket.countDocuments(filter);

        return {
            tickets,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        };
    } catch (error) {
        throw error;
    }
};

module.exports = getClosedTickets;