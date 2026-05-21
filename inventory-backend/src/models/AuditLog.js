const db = require('../config/db')

const AuditLog = {
  create: ({ id, userId, action, entity, entityId = null, meta = null }) =>
    db.prepare(
      'INSERT INTO audit_logs (id, userId, action, entity, entityId, meta) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, userId, action, entity, entityId, meta ? JSON.stringify(meta) : null),

  findByUser: (userId) =>
    db.prepare('SELECT * FROM audit_logs WHERE userId = ? ORDER BY createdAt DESC').all(userId),

  findAll: () =>
    db.prepare('SELECT * FROM audit_logs ORDER BY createdAt DESC').all(),
}

module.exports = AuditLog
