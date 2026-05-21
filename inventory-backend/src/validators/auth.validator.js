const { z } = require('zod')

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const verifySchema = z.object({
  username: z.string().min(1, 'Username is required'),
  code: z.string().length(6, 'Code must be 6 digits'),
})

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

module.exports = { registerSchema, verifySchema, loginSchema, refreshSchema }
