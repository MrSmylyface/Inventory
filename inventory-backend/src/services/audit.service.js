const AuditLog = require('../models/AuditLog')

function log({ userId, action, entity, entityId, meta }) {
  const id = Date.now().toString()
  AuditLog.create({ id, userId, action, entity, entityId, meta })
}

module.exports = { log }
