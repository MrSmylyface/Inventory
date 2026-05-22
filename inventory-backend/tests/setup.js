const mongoose = require('mongoose')

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test_secret'
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_test'
  await mongoose.connect(uri)
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})
