async function getTotalRevenue(Payment, startDate, endDate, customerId, currency) {
    // Base match conditions
    const matchConditions = {
        payment_date: { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
        },
        payment_status: 'approved'
    };

    // Optional filters
    if (customerId) {
        matchConditions.customer_id = customerId;
    }
    if (currency) {
        matchConditions.currency = currency;
    }

    const aggregationPipeline = [
        { $match: matchConditions },
        {
            $group: {
                _id: null,
                total: { $sum: '$total_amount' },
                count: { $sum: 1 },
                byCurrency: { 
                    $push: {
                        currency: '$currency',
                        amount: '$total_amount'
                    } 
                }
            }
        },
        {
            $project: {
                _id: 0,
                total: 1,
                count: 1,
                byCurrency: {
                    $reduce: {
                        input: '$byCurrency',
                        initialValue: [],
                        in: {
                            $let: {
                                vars: {
                                    existing: {
                                        $filter: {
                                            input: '$$value',
                                            as: 'item',
                                            cond: { $eq: ['$$item.currency', '$$this.currency'] }
                                        }
                                    }
                                },
                                in: {
                                    $concatArrays: [
                                        { $filter: {
                                            input: '$$value',
                                            as: 'item',
                                            cond: { $ne: ['$$item.currency', '$$this.currency'] }
                                        }},
                                        [{
                                            currency: '$$this.currency',
                                            total: {
                                                $sum: [
                                                    { $ifNull: [{ $arrayElemAt: ['$$existing.total', 0] }, 0] },
                                                    '$$this.amount'
                                                ]
                                            },
                                            count: {
                                                $sum: [
                                                    { $ifNull: [{ $arrayElemAt: ['$$existing.count', 0] }, 0] },
                                                    1
                                                ]
                                            }
                                        }]
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        }
    ];

    const [result] = await Payment.aggregate(aggregationPipeline);
    
    return result || { 
        total: 0, 
        count: 0, 
        byCurrency: [],
        currency: currency || undefined
    };
}

module.exports = getTotalRevenue;