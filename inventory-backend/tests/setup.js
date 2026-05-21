const Database = require('better-sqlite3')
const path = require('path')

let testDb

beforeAll(() => {
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test_secret'
  testDb = new Database(':memory:')
  testDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT NOT NULL,
      password TEXT NOT NULL, verified INTEGER NOT NULL DEFAULT 0,
      verificationCode TEXT, role TEXT NOT NULL DEFAULT 'staff',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, quantity REAL NOT NULL,
      price REAL NOT NULL, categoryId TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, description TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY, userId TEXT NOT NULL, action TEXT NOT NULL,
      entity TEXT NOT NULL, entityId TEXT, meta TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
  jest.mock('../src/config/db', () => testDb)
})

afterAll(() => {
  testDb.close()
})
