require('../src/config/env')
const db = require('../src/config/db')

const categories = [
  { id: '1', name: 'Electronics', description: 'Electronic devices and accessories' },
  { id: '2', name: 'Office Supplies', description: 'Stationery and office equipment' },
  { id: '3', name: 'Furniture', description: 'Desks, chairs, and storage' },
]

const items = [
  { id: '101', name: 'Laptop', quantity: 15, price: 999.99, categoryId: '1' },
  { id: '102', name: 'Monitor', quantity: 8, price: 299.99, categoryId: '1' },
  { id: '103', name: 'Notebook', quantity: 100, price: 2.99, categoryId: '2' },
  { id: '104', name: 'Standing Desk', quantity: 5, price: 459.00, categoryId: '3' },
]

const insertCategory = db.prepare(
  'INSERT OR IGNORE INTO categories (id, name, description) VALUES (?, ?, ?)'
)
const insertItem = db.prepare(
  'INSERT OR IGNORE INTO items (id, name, quantity, price, categoryId, updatedAt) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))'
)

const seedAll = db.transaction(() => {
  for (const c of categories) insertCategory.run(c.id, c.name, c.description)
  for (const i of items) insertItem.run(i.id, i.name, i.quantity, i.price, i.categoryId)
})

seedAll()
console.log('Database seeded successfully.')
