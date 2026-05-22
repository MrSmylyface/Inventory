const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { generateTokens, verifyToken } = require('../utils/jwt')
const { sendVerificationEmail } = require('../utils/email')
const {
  USERNAME_EXISTS, USER_NOT_FOUND, INVALID_CODE,
  EMAIL_NOT_VERIFIED, INVALID_CREDENTIALS, INVALID_REFRESH_TOKEN,
} = require('../constants/messages')

async function register({ username, password, email }) {
  if (await User.findOne({ username })) return { error: USERNAME_EXISTS }
  const hashedPassword = await bcrypt.hash(password, 10)
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  await User.create({ username, email, password: hashedPassword, verificationCode: code })
  await sendVerificationEmail(email, username, code)
  return { success: true }
}

async function verify({ username, code }) {
  const user = await User.findOne({ username })
  if (!user) return { error: USER_NOT_FOUND }
  if (user.verificationCode !== code) return { error: INVALID_CODE }
  user.verified = true
  user.verificationCode = null
  await user.save()
  return { success: true }
}

async function login({ username, password }) {
  const user = await User.findOne({ username })
  if (!user) return { error: INVALID_CREDENTIALS }
  if (!user.verified) return { error: EMAIL_NOT_VERIFIED }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) return { error: INVALID_CREDENTIALS }
  return { tokens: generateTokens(user) }
}

function refresh(refreshToken) {
  const decoded = verifyToken(refreshToken)
  if (!decoded) return { error: INVALID_REFRESH_TOKEN }
  const accessToken = jwt.sign(
    { id: decoded.id, username: decoded.username },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
  return { accessToken }
}

module.exports = { register, verify, login, refresh }
