const bcrypt = require('bcrypt')
const User = require('../models/User')
const { USER_NOT_FOUND, INVALID_PASSWORD, USERNAME_TAKEN } = require('../constants/messages')

async function changeUsername(userId, { newUsername, password }) {
  const user = await User.findById(userId)
  if (!user) return { error: USER_NOT_FOUND, status: 404 }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) return { error: INVALID_PASSWORD }
  if (await User.findOne({ username: newUsername })) return { error: USERNAME_TAKEN }
  user.username = newUsername
  await user.save()
  return { success: true }
}

async function changePassword(userId, { newPassword, password }) {
  const user = await User.findById(userId)
  if (!user) return { error: USER_NOT_FOUND, status: 404 }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) return { error: INVALID_PASSWORD }
  user.password = await bcrypt.hash(newPassword, 10)
  await user.save()
  return { success: true }
}

module.exports = { changeUsername, changePassword }
