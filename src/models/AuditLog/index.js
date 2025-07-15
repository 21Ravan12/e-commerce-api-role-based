const mongoose = require('mongoose');
const auditLogSchema = require('./schemas/auditLogSchema');
const adminLogSchema = require('./schemas/adminLogSchema'); 

// Register model if not already registered
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
const AdminLog = mongoose.models.AdminLog || mongoose.model('AdminLog', adminLogSchema);

// Import operations
const createLog = require('./operations/auditLog/createLog');
const getLogById = require('./operations/auditLog/getLogById');
const getLogs = require('./operations/auditLog/getLogs');
const getLogsByUserId = require('./operations/auditLog/getLogsByUserId');
const purgeOldLogs = require('./operations/auditLog/purgeOldLogs');

// Import operations
const createAdminLog = require('./operations/adminLog/createAdminLog');
const getAdminLogById = require('./operations/adminLog/getAdminLogById');
const getAdminLogs = require('./operations/adminLog/getAdminLogs');
const updateAdminLog = require('./operations/adminLog/updateAdminLog');
const createTimedAdminLog = require('./operations/adminLog/createTimedAdminLog');

// Add query helpers
auditLogSchema.query.byUser = function(userId) {
  return this.where({ user: userId });
};

auditLogSchema.query.byEmail = function(email) {
  return this.where({ userEmail: email.toLowerCase() });
};

auditLogSchema.query.byEvent = function(event) {
  return this.where({ event });
};

auditLogSchema.query.recent = function(days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return this.where('timestamp').gte(cutoff);
};

auditLogSchema.query.byCorrelationId = function(correlationId) {
  return this.where({ correlationId });
};

// Export initialized model and operations
module.exports = {
  AuditLog, // Export the model instance
  AdminLog,
  createLog: createLog.bind(null, AuditLog), // Pre-bind the model
  getLogById: getLogById.bind(null, AuditLog),
  getLogs: getLogs.bind(null, AuditLog),
  purgeOldLogs: purgeOldLogs.bind(null, AuditLog),
  getLogsByUserId: getLogsByUserId.bind(null, AuditLog), // Pre-bind both models
  createAdminLog: createAdminLog.bind(null, AdminLog), // Pre-bind the model
  getAdminLogById: getAdminLogById.bind(null, AdminLog),
  getAdminLogs: getAdminLogs.bind(null, AdminLog),
  updateAdminLog: updateAdminLog.bind(null, AdminLog),
  createTimedAdminLog: createTimedAdminLog.bind(null, AdminLog, createAdminLog, updateAdminLog)
};