const bcrypt = require('bcrypt')
const User = require('../models/User')
const { USER_NOT_FOUND, INVALID_PASSWORD, USERNAME_TAKEN } = require('../constants/messages')

async function changeUsername(userId, { newUsername, password }) {
  const user = User.findById(userId)
  if (!user) return { error: USER_NOT_FOUND, status: 404 }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) return { error: INVALID_PASSWORD }
  if (User.existsByUsername(newUsername)) return { error: USERNAME_TAKEN }
  User.updateUsername(userId, newUsername)
  return { success: true }
}

async function changePassword(userId, { newPassword, password }) {
  const user = User.findById(userId)
  if (!user) return { error: USER_NOT_FOUND, status: 404 }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) return { error: INVALID_PASSWORD }
  const hashed = await bcrypt.hash(newPassword, 10)
  User.updatePassword(userId, hashed)
  return { success: true }
}

module.exports = { changeUsername, changePassword }
