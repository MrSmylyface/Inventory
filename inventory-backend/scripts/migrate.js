require('../src/config/env')
const mongoose = require('mongoose')

// MongoDB migrations are handled via schema changes in models.
// Add migration steps here if you need to transform existing data.
const migrations = [
  {
    version: 1,
    description: 'Initial schema — no data migration needed',
    up: async () => {},
  },
]

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const db = mongoose.connection.db
  const col = db.collection('migrations')

  const applied = await col.find({}).toArray()
  const appliedVersions = applied.map((m) => m.version)

  for (const m of migrations) {
    if (!appliedVersions.includes(m.version)) {
      await m.up()
      await col.insertOne({ version: m.version, description: m.description, appliedAt: new Date() })
      console.log(`Applied migration v${m.version}: ${m.description}`)
    }
  }

  console.log('Migrations complete.')
  await mongoose.disconnect()
}

migrate().catch((err) => { console.error(err); process.exit(1) })
