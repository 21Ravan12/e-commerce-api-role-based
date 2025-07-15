const PromotionCode = require('../../../../../models/PromotionCode');
const logger = require('../../../../../services/logger');
const RedisClient = require('../../../../../lib/redis');

class PromotionCodeController {
  constructor() {
    this.redis = RedisClient;
  }

  async getPromotionCodes(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AdminLog.createTimedAdminLog({
        action: 'get_promotion_codes',
        targetModel: 'PromotionCode',
        performedBy: req.user?._id,
        performedByEmail: req.user?.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            queryParameters: req.query,
            headers: {
                referer: req.headers.referer,
                origin: req.headers.origin
            }
        }
    });

    try {
        logger.info(`Get promotion codes request from IP: ${req.ip}`);
        
        const { error, value } = promotionCodeGetSchema.validate(req.query);
        if (error) {
            const errorMessages = error.details.map(detail => detail.message).join(', ');
            await complete({
                status: 'failed',
                details: {
                    error: 'Validation error',
                    validationErrors: error.details.map(detail => ({
                        path: detail.path,
                        message: detail.message,
                        type: detail.type
                    })),
                    errorMessages
                }
            });
            return res.status(400).json({ error: `Validation error: ${errorMessages}` });
        }

        // Build filter
        const filter = {};
        if (value.status) filter.status = value.status;
        if (value.type) filter.promotionType = value.type;
        
        // Active codes filter
        if (value.active === true) {
            const now = new Date();
            filter.startDate = { $lte: now };
            filter.endDate = { $gte: now };
            filter.status = 'active';
        }

        // Search filter
        if (value.search) {
            filter.$or = [
                { promotionCode: { $regex: value.search, $options: 'i' } },
                { description: { $regex: value.search, $options: 'i' } }
            ];
        }

        // Get promotion codes using static method
        const { promotionCodes, total, page, pages } = await PromotionCode.findPromotionCodes(
            filter, 
            value.page, 
            value.limit
        );

        // Enhance codes with virtual properties
        const now = new Date();
        const enhancedCodes = promotionCodes.map(code => ({
            ...code.toObject(),
            isActive: code.status === 'active' && now >= new Date(code.startDate) && now <= new Date(code.endDate),
            remainingUses: code.usageLimit ? code.usageLimit - code.usageCount : null,
            links: {
                self: `/promotion-codes/${code._id}`,
                admin: `/admin/promotion-codes/${code._id}`
            }
        }));

        const response = {
            success: true,
            count: enhancedCodes.length,
            total,
            page,
            pages,
            promotionCodes: enhancedCodes,
            links: {
                first: `/promotion-codes?page=1&limit=${value.limit}`,
                last: `/promotion-codes?page=${pages}&limit=${value.limit}`,
                prev: page > 1 ? `/promotion-codes?page=${page - 1}&limit=${value.limit}` : null,
                next: page < pages ? `/promotion-codes?page=${page + 1}&limit=${value.limit}` : null
            }
        };

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                filterUsed: filter,
                pagination: {
                    page: value.page,
                    limit: value.limit,
                    totalResults: total,
                    totalPages: pages
                },
                returnedCount: enhancedCodes.length,
                firstCodeId: enhancedCodes.length > 0 ? enhancedCodes[0]._id : null
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
                queryParams: req.query,
                systemError: true
            }
        });

        logger.error(`Get promotion codes error: ${error.message}`, { 
            stack: error.stack,
            queryParams: req.query 
        });
        
        res.status(500).json({ 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined,
            requestId: req.id
        });
    }
  }

  async getPromotionCode(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AdminLog.createTimedAdminLog({
        action: 'get_promotion_code',
        targetModel: 'PromotionCode',
        targetId: req.params.id,
        performedBy: req.user?._id,
        performedByEmail: req.user?.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            promotionCodeId: req.params.id,
            requestHeaders: {
                accept: req.headers['accept'],
                referer: req.headers['referer']
            }
        }
    });

    try {
        // Get the promotion code using the standalone function
        const promotionCode = await findPromotionCodeById(
            PromotionCode, 
            req.params.id
        );

        if (!promotionCode) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Promotion code not found',
                    notFound: true,
                    promotionCodeId: req.params.id
                }
            });
            return res.status(404).json({
                success: false,
                error: 'Promotion code not found'
            });
        }

        // Enhance the promotion code with virtual properties and links
        const now = new Date();
        const enhancedCode = {
            ...promotionCode,
            isActive: promotionCode.status === 'active' && 
                     now >= new Date(promotionCode.startDate) && 
                     now <= new Date(promotionCode.endDate),
            remainingUses: promotionCode.usageLimit ? 
                          promotionCode.usageLimit - promotionCode.usageCount : 
                          null,
            links: {
                self: `/promotion-codes/${promotionCode._id}`,
                admin: `/admin/promotion-codes/${promotionCode._id}`,
                applicableCategories: promotionCode.applicableCategories?.map(cat => 
                    `/categories/${cat._id}`
                ),
                excludedProducts: promotionCode.excludedProducts?.map(prod => 
                    `/products/${prod._id}`
                )
            }
        };

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                promotionCodeDetails: {
                    id: promotionCode._id,
                    code: promotionCode.code,
                    discountType: promotionCode.discountType,
                    discountValue: promotionCode.discountValue,
                    isActive: enhancedCode.isActive,
                    usageCount: promotionCode.usageCount,
                    usageLimit: promotionCode.usageLimit
                },
                validity: {
                    startDate: promotionCode.startDate,
                    endDate: promotionCode.endDate,
                    currentStatus: enhancedCode.isActive ? 'active' : 'inactive'
                }
            }
        });

        const response = {
            success: true,
            promotionCode: enhancedCode,
            meta: {
                currentDateTime: now.toISOString(),
                validity: {
                    isActive: enhancedCode.isActive,
                    activePeriod: {
                        start: promotionCode.startDate,
                        end: promotionCode.endDate
                    }
                }
            }
        };

        res
            .set('X-Content-Type-Options', 'nosniff')
            .set('X-Frame-Options', 'DENY')
            .status(200)
            .json(response);

    } catch (error) {
        // Prepare error details for logging
        const errorDetails = {
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            promotionCodeId: req.params.id,
            isInvalidId: error.message.includes('Invalid promotion code ID format')
        };

        // Complete the log with error details
        await complete({
            status: 'failed',
            details: errorDetails
        });

        // Determine appropriate status code
        const statusCode = error.message.includes('Invalid promotion code ID format') ? 
                          400 : 500;

        res.status(statusCode).json({ 
            success: false,
            error: statusCode === 400 ? 'Validation error' : 'Internal server error',
            message: error.message,
            ...(statusCode === 400 && { 
                details: {
                    validIdFormat: 'Hex string of 24 characters',
                    example: '507f1f77bcf86cd799439011'
                }
            }),
            systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }
}

module.exports = new PromotionCodeController();