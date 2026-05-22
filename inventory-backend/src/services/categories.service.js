const Category = require('../models/Category')

async function getAll() {
  return Category.find()
}

async function create({ name, description }) {
  if (await Category.findOne({ name })) return { error: 'Category already exists.' }
  return Category.create({ name, description })
}

async function update(id, { name, description }) {
  return Category.findByIdAndUpdate(id, { name, description }, { new: true, runValidators: true })
}

async function remove(id) {
  await Category.findByIdAndDelete(id)
}

module.exports = { getAll, create, update, remove }
