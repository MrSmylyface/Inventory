const router = require('express').Router()
const usersController = require('../controllers/users.controller')
const authMiddleware = require('../middleware/auth')

router.put('/change-username', authMiddleware, usersController.changeUsername)
router.put('/change-password', authMiddleware, usersController.changePassword)

module.exports = router
