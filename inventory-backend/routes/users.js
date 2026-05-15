const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const db = require('../utils/db')
const authMiddleware = require('../middleware/authMiddleware')

router.put('/change-username', authMiddleware, async (req, res) => {
  const { newUsername, password } = req.body
  if (!newUsername || !password) {
    return res.status(400).json({ error: 'New username and password are required' })
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid password' })
  }
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(newUsername)) {
    return res.status(400).json({ error: 'Username already taken' })
  }
  db.prepare('UPDATE users SET username = ? WHERE id = ?').run(newUsername, user.id)
  res.json({ message: 'Username updated successfully' })
})

router.put('/change-password', authMiddleware, async (req, res) => {
  const { newPassword, password } = req.body
  if (!newPassword || !password) {
    return res.status(400).json({ error: 'New password and current password are required' })
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid password' })
  }
  const hashed = await bcrypt.hash(newPassword, 10)
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, user.id)
  res.json({ message: 'Password updated successfully' })
})

module.exports = router
