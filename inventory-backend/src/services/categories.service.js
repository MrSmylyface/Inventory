const Category = require('../models/Category')

function getAll() {
  return Category.findAll()
}

function create({ name, description }) {
  if (Category.findByName(name)) return { error: 'Category already exists.' }
  const id = Date.now().toString()
  Category.create({ id, name, description })
  return { id, name, description }
}

function update(id, { name, description }) {
  if (!Category.findById(id)) return null
  Category.update(id, { name, description })
  return { id, name, description }
}

function remove(id) {
  Category.delete(id)
}

module.exports = { getAll, create, update, remove }
