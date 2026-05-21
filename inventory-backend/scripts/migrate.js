require('../src/config/env')
const db = require('../src/config/db')

const migrations = [
  {
    version: 1,
    description: 'Initial schema',
    up: () => {}, // already applied via db.js on startup
  },
]

db.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    version INTEGER PRIMARY KEY,
    description TEXT,
    appliedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

const applied = db.prepare('SELECT version FROM migrations').all().map((r) => r.version)

for (const m of migrations) {
  if (!applied.includes(m.version)) {
    m.up()
    db.prepare('INSERT INTO migrations (version, description) VALUES (?, ?)').run(m.version, m.description)
    console.log(`Applied migration v${m.version}: ${m.description}`)
  }
}

console.log('Migrations complete.')
