const AuditLog = require('../models/AuditLog')

async function log({ userId, action, entity, entityId, meta }) {
  await AuditLog.create({ userId, action, entity, entityId: entityId || null, meta: meta || null })
}

module.exports = { log }
