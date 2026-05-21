const db = require('../config/db')

const User = {
  findById: (id) =>
    db.prepare('SELECT * FROM users WHERE id = ?').get(id),

  findByUsername: (username) =>
    db.prepare('SELECT * FROM users WHERE username = ?').get(username),

  existsByUsername: (username) =>
    !!db.prepare('SELECT id FROM users WHERE username = ?').get(username),

  create: ({ id, username, email, password, verificationCode }) =>
    db.prepare(
      'INSERT INTO users (id, username, email, password, verified, verificationCode) VALUES (?, ?, ?, ?, 0, ?)'
    ).run(id, username, email, password, verificationCode),

  verify: (id) =>
    db.prepare('UPDATE users SET verified = 1, verificationCode = NULL WHERE id = ?').run(id),

  updateUsername: (id, username) =>
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, id),

  updatePassword: (id, password) =>
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(password, id),
}

module.exports = User
