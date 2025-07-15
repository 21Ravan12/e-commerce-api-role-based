const getUserTickets = async (Ticket, userId, options = {}, query = {}) => {
    try {
        const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
        const filter = { 
            createdBy: userId,
            ...query 
        };

        const tickets = await Ticket.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
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

module.exports = getUserTickets;