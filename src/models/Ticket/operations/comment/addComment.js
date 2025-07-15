const addComment = async (Ticket, Comment, ticketId, userId, content, isInternal = false) => {
    try {
        // Check if ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // Create comment
        const comment = new Comment({
            ticket: ticketId,
            author: userId,
            content,
            isInternal
        });

        await comment.save();

        // Update ticket's updatedAt
        ticket.updatedAt = new Date();
        await ticket.save();

        return comment.populate('author', 'name email');
    } catch (error) {
        throw error;
    }
};

module.exports = addComment;