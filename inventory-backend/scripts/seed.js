require('../src/config/env')
const mongoose = require('mongoose')
const Category = require('../src/models/Category')
const Item = require('../src/models/Item')

const categories = [
  { name: 'Electronics',    description: 'Electronic devices and accessories' },
  { name: 'Office Supplies', description: 'Stationery and office equipment' },
  { name: 'Furniture',      description: 'Desks, chairs, and storage' },
]

const itemsData = [
  { name: 'Laptop',       quantity: 15, price: 999.99, categoryName: 'Electronics' },
  { name: 'Monitor',      quantity: 8,  price: 299.99, categoryName: 'Electronics' },
  { name: 'Notebook',     quantity: 100, price: 2.99,  categoryName: 'Office Supplies' },
  { name: 'Standing Desk', quantity: 5, price: 459.00, categoryName: 'Furniture' },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  await Category.deleteMany({})
  await Item.deleteMany({})

  const createdCategories = await Category.insertMany(categories)
  const categoryMap = Object.fromEntries(createdCategories.map((c) => [c.name, c._id]))

  const items = itemsData.map(({ categoryName, ...rest }) => ({
    ...rest,
    categoryId: categoryMap[categoryName] || null,
  }))

  await Item.insertMany(items)
  console.log('Database seeded successfully.')
  await mongoose.disconnect()
}

seed().catch((err) => { console.error(err); process.exit(1) })
