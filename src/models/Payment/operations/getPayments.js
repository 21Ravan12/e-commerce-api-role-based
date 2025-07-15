const { ObjectId } = require('mongodb');

async function getPayments(Payment, customerId, page = 1, limit = 10, query = {}, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        // Build filter based on schema fields
        let filter = {};
        if (customerId && ObjectId.isValid(customerId)) {
            filter.customer_id = new ObjectId(customerId);
        } else if (customerId) {
            throw new Error('Invalid customerId provided');
        }
        
        // Add query filters if provided
        if (query.payment_status) {
            filter.payment_status = query.payment_status;
        }
        if (query.payment_method) {
            filter.payment_method = query.payment_method;
        }
        if (query.currency) {
            filter.currency = query.currency;
        }
        if (query.min_amount) {
            filter.total_amount = { ...filter.total_amount, $gte: parseFloat(query.min_amount) };
        }
        if (query.max_amount) {
            filter.total_amount = { ...filter.total_amount, $lte: parseFloat(query.max_amount) };
        }
        if (query.start_date) {
            filter.payment_date = { ...filter.payment_date, $gte: new Date(query.start_date) };
        }
        if (query.end_date) {
            filter.payment_date = { ...filter.payment_date, $lte: new Date(query.end_date) };
        }
        if (query.search) {
            filter.$or = [
                { payment_id: { $regex: query.search, $options: 'i' } },
                { description: { $regex: query.search, $options: 'i' } }
            ];
        }

        const [payments, total] = await Promise.all([
            Payment.find(filter)
                .populate('order_id', 'orderNumber status')
                .populate('customer_id', 'firstName lastName email')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Payment.countDocuments(filter)
        ]);

        const pages = Math.ceil(total / limit);

        // Enhance payments with virtuals and links
        const enhancedPayments = payments.map(payment => {
            const enhanced = {
                ...payment,
                // Include virtual fields that would normally be available in toJSON
                formatted_amount: new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: payment.currency
                }).format(payment.total_amount),
                links: {
                    self: `/payment/get/${payment._id}`,
                    order: `/order/get/${payment.order_id?._id || ''}`,
                    customer: `/user/get/${payment.customer_id?._id || ''}`
                }
            };
            
            // Remove internal fields if needed
            delete enhanced.__v;
            delete enhanced.processor_response;
            delete enhanced.metadata;
            
            return enhanced;
        });

        const response = {
            success: true,
            count: enhancedPayments.length,
            total,
            page: parseInt(page),
            pages,
            payments: enhancedPayments,
            links: {
                first: `/payment/get?page=1&limit=${limit}`,
                last: `/payment/get?page=${pages}&limit=${limit}`,
                prev: page > 1 ? `/payment/get?page=${page - 1}&limit=${limit}` : null,
                next: page < pages ? `/payment/get?page=${parseInt(page) + 1}&limit=${limit}` : null
            },
            filters: {
                available_statuses: ['created', 'approved', 'failed', 'pending', 'refunded', 'partially_refunded'],
                available_methods: ['paypal', 'credit_card', 'bank_transfer', 'stripe', 'apple_pay', 'google_pay'],
                available_currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
            }
        };

        return { response };
    } catch (error) {
        console.error('Error in getPayments:', error);
        throw error;
    }
}

module.exports = getPayments;