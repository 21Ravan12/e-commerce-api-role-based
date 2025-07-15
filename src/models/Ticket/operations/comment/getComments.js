const getComments = async (Comment, ticketId, options = {}) => {
    try {
        const { page = 1, limit = 10, sort = { createdAt: -1 }, showInternal = false } = options;
        
        const filter = { ticket: ticketId };
        if (!showInternal) {
            filter.isInternal = false;
        }

        const comments = await Comment.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'name email')
            .lean();

        const total = await Comment.countDocuments(filter);

        return {
            comments,
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

module.exports = getComments;