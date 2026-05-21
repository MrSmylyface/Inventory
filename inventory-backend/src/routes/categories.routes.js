const router = require('express').Router()
const categoriesController = require('../controllers/categories.controller')
const authMiddleware = require('../middleware/auth')
const validate = require('../middleware/validate')
const { categorySchema } = require('../validators/category.validator')

router.get('/', authMiddleware, categoriesController.getAll)
router.post('/', authMiddleware, validate(categorySchema), categoriesController.create)
router.put('/:id', authMiddleware, validate(categorySchema), categoriesController.update)
router.delete('/:id', authMiddleware, categoriesController.remove)

module.exports = router
