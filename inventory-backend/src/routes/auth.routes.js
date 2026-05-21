const router = require('express').Router()
const authController = require('../controllers/auth.controller')
const validate = require('../middleware/validate')
const { registerSchema, verifySchema, loginSchema, refreshSchema } = require('../validators/auth.validator')

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 *
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Username already exists
 */
router.post('/register', validate(registerSchema), authController.register)

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify email with code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid code
 */
router.post('/verify', validate(verifySchema), authController.verify)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and get tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns access and refresh tokens
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), authController.login)

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a new access token
 *       400:
 *         description: Invalid refresh token
 */
router.post('/refresh', validate(refreshSchema), authController.refresh)

module.exports = router
