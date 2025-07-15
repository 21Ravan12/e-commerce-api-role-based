const getAssignedTickets = async (Ticket, userId, options = {}) => {
    try {
        const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
        const filter = { 
            assignedTo: userId
        };

        const tickets = await Ticket.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
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

module.exports = getAssignedTickets;