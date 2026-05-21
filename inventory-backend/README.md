# Inventory Backend

REST API for inventory management built with Express.js and SQLite.

## Quick start

```bash
cp .env.example .env   # fill in your values
npm install
npm run dev
```

API docs: http://localhost:3001/api-docs

## Scripts

| Command        | Description                  |
|----------------|------------------------------|
| `npm run dev`  | Start with nodemon (watch)   |
| `npm start`    | Start in production mode     |
| `npm test`     | Run test suite               |
| `npm run seed` | Seed DB with sample data     |
| `npm run migrate` | Run DB migrations         |

## Docker

```bash
docker compose up
```

## Project structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a full breakdown.
