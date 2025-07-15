const Payment = require('../../../../../models/Payment');
const AuditLog = require('../../../../../models/AuditLog/index');
const logger = require('../../../../../services/logger');
const RedisClient = require('../../../../../lib/redis');

// Define redactSensitiveFields as a standalone function
function redactSensitiveFields(obj = {}) {
    const SENSITIVE_FIELDS = ['min_amount', 'max_amount', 'search', 'cardNumber', 'accountNumber'];
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) =>
            SENSITIVE_FIELDS.includes(key)
                ? [key, value ? '<REDACTED>' : undefined]
                : [key, value]
        )
    );
}

class PaymentController {
  constructor() {
    this.redis = RedisClient;
    this.redactSensitiveFields = redactSensitiveFields;
  }

  async getPayment(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'get_payment',
        targetModel: 'Payment',
        targetId: req.params.id,
        performedBy: req.user?._id,  // Optional chaining in case it's a public endpoint
        performedByEmail: req.user?.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedPaymentId: req.params.id,
            headers: {
                referer: req.headers.referer,
                origin: req.headers.origin
            }
        }
    });

    try {
        logger.info(`Get payment request for ID: ${req.params.id} from IP: ${req.ip}`);

        const payment = await Payment.getPayment(req.params.id);
        
        if (!payment) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Payment not found',
                    notFound: true
                }
            });
            return res.status(404).json({ 
                success: false,
                error: 'Payment not found' 
            });
        }

        // Add security audit for sensitive payment data access
        if (payment.status === 'success' || payment.amount > 10000) { // Example threshold
            await AuditLog.createSecurityAudit({
                action: 'high_value_payment_access',
                targetId: payment?._id,
                performedBy: req.user?._id,
                details: {
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status
                }
            });
        }

        const response = {
            success: true,
            payment: {
                ...payment.toObject(),
                // Mask sensitive payment data in the response if needed
                cardNumber: payment.cardNumber ? '•••• •••• •••• ' + payment.cardNumber.slice(-4) : undefined,
                links: {
                    self: `/payment/get/${payment?._id}`,
                    order: `/order/get/${payment.order?._id}`
                }
            }
        };

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                paymentData: {
                    id: payment?._id,
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status,
                    orderId: payment.order?._id
                },
                responseHeaders: {
                    contentType: res.get('Content-Type'),
                    securityHeaders: {
                        xContentTypeOptions: res.get('X-Content-Type-Options'),
                        xFrameOptions: res.get('X-Frame-Options')
                    }
                }
            }
        });

        res
            .set('X-Content-Type-Options', 'nosniff')
            .set('X-Frame-Options', 'DENY')
            .set('X-Payment-ID', payment?._id.toString())
            .status(200)
            .json(response);

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                paymentId: req.params.id,
                errorType: error.name
            }
        });

        logger.error(`Get payment error: ${error.message}`, { 
            stack: error.stack,
            paymentId: req.params.id 
        });
        
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined,
            code: error.code || 'SERVER_ERROR'
        });
    }
  }

  async getPayments(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'get_payments',
        targetModel: 'Payment',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            queryParams: redactSensitiveFields(req.query),
            customerId: req.user._id,
            isAdminRequest: req.user.roles.includes('admin')
        }
    });

    try {
        // Extract query parameters with defaults
        const { 
            page = 1, 
            limit = 10, 
            payment_status, 
            payment_method, 
            currency,
            min_amount,
            max_amount,
            start_date,
            end_date,
            search,
            sortBy = 'payment_date',
            sortOrder = 'desc'
        } = req.query;

        // Prepare query object for logging
        const queryForLog = {
            payment_status,
            payment_method,
            currency,
            min_amount: min_amount ? '<REDACTED>' : undefined,
            max_amount: max_amount ? '<REDACTED>' : undefined,
            start_date,
            end_date,
            search: search ? '<REDACTED>' : undefined
        };

        // Get payments using the standalone function
        const { response } = await Payment.getPayments(
            req.user._id,
            parseInt(page),
            parseInt(limit),
            {
                payment_status,
                payment_method,
                currency,
                min_amount,
                max_amount,
                start_date,
                end_date,
                search
            },
            sortBy,
            sortOrder
        );

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                finalPagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: response.total,
                    totalPages: response.pages
                },
                returnedCount: response.data?.length,
                appliedFilters: queryForLog,
                sort: {
                    by: sortBy,
                    order: sortOrder
                }
            }
        });

        // Add security headers and send response
        res
            .set('X-Content-Type-Options', 'nosniff')
            .set('X-Frame-Options', 'DENY')
            .set('X-RateLimit-Limit', limit)
            .set('X-RateLimit-Remaining', response.pages - page > 0 ? response.pages - page : 0)
            .status(200)
            .json(response);

    } catch (error) {
        // Prepare error details for logging
        const errorDetails = {
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            queryParams: redactSensitiveFields(req.query),
            customerId: req.user._id,
            ip: req.ip,
            errorType: error.name
        };

        // Add validation error details if applicable
        if (error.name === 'ValidationError') {
            errorDetails.validationErrors = Object.values(error.errors).map(err => err.message);
        }

        // Complete the log with error details
        await complete({
            status: 'failed',
            details: errorDetails
        });

        // Determine appropriate status code
        const statusCode = error.name === 'ValidationError' ? 400 : 500;
        
        res.status(statusCode).json({ 
            success: false,
            error: statusCode === 400 ? 'Validation error' : 'Internal server error',
            message: error.message,
            details: statusCode === 400 ? error.errors : undefined,
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }

  async findByOrder(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'find_payment_by_order',
        targetModel: 'Payment',
        performedBy: req.user?._id,
        performedByEmail: req.user?.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            orderId: req.params.orderId,
            requestHeaders: {
                'content-type': req.headers['content-type'],
                'accept': req.headers['accept']
            }
        }
    });

    try {
        const orderId = req.params.orderId;
        logger.info(`Find payment by order request for order ID: ${orderId} from IP: ${req.ip}`);

        const payment = await Payment.findByOrder(orderId);

        if (!payment) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Payment not found for this order',
                    notFound: true,
                    orderId: orderId
                }
            });
            return res.status(404).json({ 
                success: false,
                error: 'Payment not found for this order' 
            });
        }

        const response = {
            success: true,
            payment: {
                ...payment,
                links: {
                    self: `/payment/get/${payment?._id}`,
                    order: `/order/get/${payment.order?._id}`
                }
            }
        };

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                paymentId: payment?._id,
                paymentStatus: payment.status,
                orderId: payment.order?._id,
                amount: payment.amount,
                currency: payment.currency,
                responseLinks: response.payment.links
            }
        });

        res
            .set('X-Content-Type-Options', 'nosniff')
            .set('X-Frame-Options', 'DENY')
            .status(200)
            .json(response);

    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                orderId: req.params.orderId,
                errorType: error.name
            }
        });

        logger.error(`Find payment by order error: ${error.message}`, { 
            stack: error.stack,
            orderId: req.params.orderId 
        });
        
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined,
            systemError: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
  }

  async getTotalRevenue(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'get_total_revenue',
        targetModel: 'Payment',
        performedBy: req.user?._id,
        performedByEmail: req.user?.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            queryParams: req.query,
            customerContext: req.user?._id
        }
    });

    try {
        logger.info(`Get total revenue request from IP: ${req.ip}`, {
            queryParams: req.query,
            customerId: req.user?._id
        });

        // Parse date filters with defaults (last 30 days)
        const startDate = req.query.start_date 
            ? new Date(req.query.start_date)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const endDate = req.query.end_date 
            ? new Date(req.query.end_date)
            : new Date();

        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid date format',
                    validationError: true,
                    providedDates: {
                        start_date: req.query.start_date,
                        end_date: req.query.end_date
                    }
                }
            });
            return res.status(400).json({ 
                success: false,
                error: 'Invalid date format',
                details: {
                    valid_format: 'ISO 8601 (YYYY-MM-DD)',
                    example: '?start_date=2023-01-01&end_date=2023-12-31'
                }
            });
        }

        // Optional customer filter
        const customerId = req.params.id || req.user?._id;
        console.log(`Customer ID for revenue report: ${customerId}`);
        // Get revenue data
        const revenueData = await Payment.getTotalRevenue(
            startDate,
            endDate,
            customerId,
            req.query.currency
        );

        // Build response
        const response = {
            success: true,
            start_date: startDate,
            end_date: endDate,
            total_revenue: revenueData.total,
            currency: revenueData.currency || 'USD',
            payment_count: revenueData.count,
            average_payment: revenueData.count > 0 
                ? revenueData.total / revenueData.count 
                : 0,
            breakdown_by_currency: revenueData.byCurrency,
            links: {
                payments_list: `/payment/get?payment_status=approved&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
                documentation: '/api-docs#reports-total-revenue'
            }
        };

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                dateRange: {
                    start: startDate,
                    end: endDate
                },
                summary: {
                    totalRevenue: revenueData.total,
                    currency: revenueData.currency || 'USD',
                    paymentCount: revenueData.count
                },
                customerFilter: customerId || 'none',
                currencyFilter: req.query.currency || 'none'
            }
        });

        res
            .set('X-Content-Type-Options', 'nosniff')
            .set('X-Frame-Options', 'DENY')
            .set('Cache-Control', 'public, max-age=300')
            .status(200)
            .json(response);

    } catch (error) {
        // Prepare error details for logging
        const errorDetails = {
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            queryParams: req.query,
            ip: req.ip
        };

        // Add specific error type details
        if (error.name === 'ValidationError') {
            errorDetails.validationError = true;
        }

        // Complete the log with error details
        await complete({
            status: 'failed',
            details: errorDetails
        });

        logger.error(`Get total revenue error: ${error.message}`, { 
            stack: error.stack,
            queryParams: req.query,
            ip: req.ip
        });
        
        const statusCode = error.name === 'ValidationError' ? 400 : 500;
        
        res.status(statusCode).json({ 
            success: false,
            error: statusCode === 400 ? 'Invalid date range' : 'Internal server error',
            message: error.message,
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: statusCode === 400 ? {
                valid_format: 'ISO 8601 (YYYY-MM-DD)',
                example: '?start_date=2023-01-01&end_date=2023-12-31'
            } : undefined
        });
    }
  }
}

module.exports = new PaymentController();