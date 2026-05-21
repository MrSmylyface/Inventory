# API Documentation

Base URL: `http://localhost:3001/api`

Interactive docs available at: `http://localhost:3001/api-docs`

---

## Auth

| Method | Endpoint           | Auth | Description              |
|--------|--------------------|------|--------------------------|
| POST   | /auth/register     | No   | Register a new user      |
| POST   | /auth/verify       | No   | Verify email with code   |
| POST   | /auth/login        | No   | Login, receive tokens    |
| POST   | /auth/refresh      | No   | Refresh access token     |

## Inventory

| Method | Endpoint           | Auth | Description              |
|--------|--------------------|------|--------------------------|
| GET    | /inventory         | Yes  | Get all items            |
| POST   | /inventory         | Yes  | Create an item           |
| PUT    | /inventory/:id     | Yes  | Update an item           |
| DELETE | /inventory/:id     | Yes  | Delete an item           |

## Categories

| Method | Endpoint           | Auth | Description              |
|--------|--------------------|------|--------------------------|
| GET    | /categories        | Yes  | Get all categories       |
| POST   | /categories        | Yes  | Create a category        |
| PUT    | /categories/:id    | Yes  | Update a category        |
| DELETE | /categories/:id    | Yes  | Delete a category        |

## User

| Method | Endpoint                | Auth | Description              |
|--------|-------------------------|------|--------------------------|
| PUT    | /user/change-username   | Yes  | Change username          |
| PUT    | /user/change-password   | Yes  | Change password          |

## Health

| Method | Endpoint   | Auth | Description    |
|--------|------------|------|----------------|
| GET    | /health    | No   | Uptime check   |
