// No longer needs direct model import - receives it as parameter
async function createLog(AuditLog, logData) {
  try {
    const logEntry = new AuditLog({
      event: logData.event,
      user: logData.user,
      userEmail: logData.userEmail,
      ip: logData.ip === '::1' ? '127.0.0.1' : logData.ip,
      userAgent: logData.userAgent?.substring(0, 512),
      metadata: typeof logData.metadata === 'object' ? logData.metadata : {},
      status: ['success', 'failure', 'warning', 'info', 'pending'].includes(logData.status) 
        ? logData.status 
        : 'info',
      source: ['web', 'mobile', 'api', 'admin', 'system', 'cli'].includes(logData.source?.toLowerCase())
        ? logData.source.toLowerCase()
        : 'system',
      action: logData.action?.toLowerCase() || 'other',
      entityType: logData.entityType,
      entityId: logData.entityId,
      correlationId: logData.correlationId || require('uuid').v4()
    });

    await logEntry.save();
    return logEntry;
  } catch (err) {
    console.error('AuditLog creation error:', err);
    // Fallback to console logging if audit logging fails
    console.log('AUDIT_LOG_FALLBACK:', {
      timestamp: new Date(),
      ...logData,
      error: err.message
    });
    return null;
  }
}

module.exports = createLog;