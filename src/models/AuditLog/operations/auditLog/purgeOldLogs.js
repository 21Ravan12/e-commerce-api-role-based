async function purgeOldLogs(AuditLog, days = 365) {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const result = await AuditLog.deleteMany({ 
      timestamp: { $lt: cutoff } 
    });
    
    return {
      deletedCount: result.deletedCount,
      cutoffDate: cutoff,
      status: 'success'
    };
  } catch (error) {
    console.error('Error purging old logs:', error);
    return {
      deletedCount: 0,
      cutoffDate: null,
      status: 'failed',
      error: error.message
    };
  }
}

module.exports = purgeOldLogs;