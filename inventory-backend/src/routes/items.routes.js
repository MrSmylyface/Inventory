const router = require('express').Router()
const itemsController = require('../controllers/items.controller')
const authMiddleware = require('../middleware/auth')
const validate = require('../middleware/validate')
const { itemSchema } = require('../validators/item.validator')

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management
 *
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         quantity:
 *           type: number
 *         price:
 *           type: number
 *         categoryId:
 *           type: string
 *
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, itemsController.getAll)

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Add a new inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       201:
 *         description: Created item
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validate(itemSchema), itemsController.create)

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update an inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Updated item
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authMiddleware, validate(itemSchema), itemsController.update)

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authMiddleware, itemsController.remove)

module.exports = router
