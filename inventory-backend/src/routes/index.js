const router = require('express').Router()

router.use('/auth', require('./auth.routes'))
router.use('/inventory', require('./items.routes'))
router.use('/categories', require('./categories.routes'))
router.use('/user', require('./users.routes'))
router.use('/health', require('./health.routes'))

module.exports = router
