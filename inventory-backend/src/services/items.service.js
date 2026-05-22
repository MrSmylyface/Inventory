const Item = require('../models/Item')

async function getAllItems() {
  return Item.find().populate('categoryId', 'name')
}

async function createItem({ name, quantity, price, categoryId }) {
  return Item.create({ name, quantity, price, categoryId: categoryId || null })
}

async function updateItem(id, { name, quantity, price, categoryId }) {
  return Item.findByIdAndUpdate(
    id,
    { name, quantity, price, categoryId: categoryId || null },
    { new: true, runValidators: true }
  )
}

async function deleteItem(id) {
  await Item.findByIdAndDelete(id)
}

module.exports = { getAllItems, createItem, updateItem, deleteItem }
