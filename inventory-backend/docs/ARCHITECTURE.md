# Architecture

## Overview

This is a layered Express.js REST API using SQLite via `better-sqlite3`.

```
Request → Route → Middleware → Controller → Service → Model → DB
```

## Layers

**Routes** — define URL patterns and attach middleware + controllers. No logic.

**Controllers** — extract data from `req`, call a service, send response via `ApiResponse`. Errors thrown as `ApiError` are caught by `asyncHandler` and forwarded to `errorHandler`.

**Services** — all business logic lives here. Calls models, makes decisions, returns plain objects or `{ error }`.

**Models** — thin wrappers around prepared SQL statements. No logic — just DB access.

## Key files

| File | Purpose |
|------|---------|
| `src/app.js` | Express setup, middleware stack, route mounting |
| `src/config/db.js` | SQLite connection and table creation |
| `src/utils/ApiError.js` | Throw this to return a structured error response |
| `src/utils/ApiResponse.js` | Standard `{ statusCode, data, message, success }` shape |
| `src/utils/asyncHandler.js` | Wraps async controllers so errors reach `errorHandler` |
| `src/middleware/validate.js` | Validates `req.body` against a Zod schema |
| `src/constants/messages.js` | All user-facing strings in one place |

## Auth flow

1. `POST /api/auth/register` — hashes password, stores unverified user, emails 6-digit code
2. `POST /api/auth/verify` — marks user verified
3. `POST /api/auth/login` — returns `{ accessToken, refreshToken }`
4. Protected routes require `Authorization: Bearer <accessToken>`
5. `POST /api/auth/refresh` — returns new `accessToken`
