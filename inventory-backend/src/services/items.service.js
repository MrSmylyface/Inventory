const Item = require('../models/Item')

function getAllItems() {
  return Item.findAll()
}

function createItem({ name, quantity, price, categoryId }) {
  const id = Date.now().toString()
  Item.create({ id, name, quantity, price, categoryId })
  return { id, name, quantity, price, categoryId }
}

function updateItem(id, { name, quantity, price, categoryId }) {
  if (!Item.findById(id)) return null
  Item.update(id, { name, quantity, price, categoryId })
  return { id, name, quantity, price, categoryId }
}

function deleteItem(id) {
  Item.delete(id)
}

module.exports = { getAllItems, createItem, updateItem, deleteItem }
