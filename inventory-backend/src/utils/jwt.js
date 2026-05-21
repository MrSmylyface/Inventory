const jwt = require('jsonwebtoken')

function generateTokens(user) {
  const accessToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '21d' })
  return { accessToken, refreshToken }
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

module.exports = { generateTokens, verifyToken }
