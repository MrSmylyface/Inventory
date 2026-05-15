const express = require("express")
const db = require("./utils/db")
const app = express()
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const authMiddleware = require("./middleware/authMiddleware")
const { specs, swaggerUi } = require('./swagger')
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)


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
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized
 */
app.get('/api/inventory',authMiddleware, (req, res) => {
  const items = db.prepare('SELECT * FROM items').all()
  res.json(items)
})

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
 *       200:
 *         description: Created item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized
 */
app.post('/api/inventory', authMiddleware, (req, res) => {
  const { name, quantity, price } = req.body
  if (!name || isNaN(quantity) || isNaN(price) || quantity === '' || price === '') {
    return res.status(400).json({ error: 'Name is required and quantity/price must be numbers' })
  }
  const item = { id: Date.now().toString(), name, quantity, price }
  db.prepare('INSERT INTO items (id, name, quantity, price) VALUES (?, ?, ?, ?)').run(item.id, item.name, item.quantity, item.price)
  res.json(item)
})

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
 *         description: Updated item data
 *       401:
 *         description: Unauthorized
 */
app.put('/api/inventory/:id', authMiddleware, (req, res) => {
  const id = req.params.id
  const { name, quantity, price } = req.body
  if (!name || isNaN(quantity) || isNaN(price) || quantity === '' || price === '') {
    return res.status(400).json({ error: 'Name is required and quantity/price must be numbers' })
  }
  const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id)
  if (!existing) {
    return res.status(404).json({ error: 'Item not found' })
  }
  db.prepare('UPDATE items SET name = ?, quantity = ?, price = ? WHERE id = ?').run(name, quantity, price, id)
  res.json({ id, name, quantity, price })
})

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
app.delete('/api/inventory/:id',authMiddleware, (req, res) => {
  const id = req.params.id
  db.prepare('DELETE FROM items WHERE id = ?').run(id)
  res.json({ message: 'Item deleted' })
})

app.listen(3001, () => {
  console.log('Server running on port 3001')
})