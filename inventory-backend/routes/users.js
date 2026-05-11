const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { readUser, writeUser } = require('../utils/db')
const authMiddleware = require('../middleware/authMiddleware')

router.put('/change-username', authMiddleware, async (req, res) => {
  const { newUsername, password } = req.body
  if (!newUsername || !password) {
    return res.status(400).json({ error: 'New username and password are required' })
  }
  const db = readUser()
  const user = db.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid password' })
  }
  if (db.users.find(u => u.username === newUsername)) {
    return res.status(400).json({ error: 'Username already taken' })
  }
  user.username = newUsername
  writeUser(db)
  res.json({ message: 'Username updated successfully' })
})

router.put('/change-password', authMiddleware, async (req, res) => {
  const { newPassword, password } = req.body
  if (!newPassword || !password) {
    return res.status(400).json({ error: 'New password and current password are required' })
  }
  const db = readUser()
  const user = db.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid password' })
  }
  user.password = await bcrypt.hash(newPassword, 10)
  writeUser(db)
  res.json({ message: 'Password updated successfully' })
})

module.exports = router
