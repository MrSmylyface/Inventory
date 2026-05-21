const db = require('../config/db')

const Item = {
  findAll: () =>
    db.prepare('SELECT * FROM items').all(),

  findById: (id) =>
    db.prepare('SELECT * FROM items WHERE id = ?').get(id),

  create: ({ id, name, quantity, price, categoryId = null }) =>
    db.prepare(
      'INSERT INTO items (id, name, quantity, price, categoryId, updatedAt) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))'
    ).run(id, name, quantity, price, categoryId),

  update: (id, { name, quantity, price, categoryId = null }) =>
    db.prepare(
      'UPDATE items SET name = ?, quantity = ?, price = ?, categoryId = ?, updatedAt = datetime(\'now\') WHERE id = ?'
    ).run(name, quantity, price, categoryId, id),

  delete: (id) =>
    db.prepare('DELETE FROM items WHERE id = ?').run(id),
}

module.exports = Item
