const db = require('../config/db')

const Category = {
  findAll: () =>
    db.prepare('SELECT * FROM categories').all(),

  findById: (id) =>
    db.prepare('SELECT * FROM categories WHERE id = ?').get(id),

  findByName: (name) =>
    db.prepare('SELECT * FROM categories WHERE name = ?').get(name),

  create: ({ id, name, description = null }) =>
    db.prepare('INSERT INTO categories (id, name, description) VALUES (?, ?, ?)').run(id, name, description),

  update: (id, { name, description }) =>
    db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(name, description, id),

  delete: (id) =>
    db.prepare('DELETE FROM categories WHERE id = ?').run(id),
}

module.exports = Category
