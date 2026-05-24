# Inventory Management App

A full-stack inventory management web app with user authentication, item tracking, and category management.

---

## Features

### Auth
- Register with username, email, and password
- Email verification via a 6-digit code (sent through EmailJS)
- Login returns an access token (15 min) and a refresh token (21 days)
- Token auto-refresh — when the access token expires the app silently refreshes it in the background
- Change username or password from the account page

### Inventory
- View all inventory items in a table
- Add items with a name, quantity, and price
- Edit items inline directly in the table
- Delete items

### Categories
- Create, edit, and delete categories
- Items can be linked to a category

### Other
- Dark / light theme toggle, preference saved in the browser
- Rate limiting — max 100 requests per 15 minutes per IP
- Swagger API docs at `http://localhost:3001/api-docs`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, Tailwind CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcrypt |
| Validation | Zod |
| Email | EmailJS |
| Logging | Pino, pino-http |
| Docs | Swagger (swagger-jsdoc, swagger-ui-express) |

---

## Project Structure

```
Inventory/
├── inventory-backend/
│   ├── src/
│   │   ├── config/        # DB, logger, swagger, env
│   │   ├── constants/     # HTTP status codes, messages
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, validation, rate limiter, error handler
│   │   ├── models/        # Mongoose models (User, Item, Category)
│   │   ├── routes/        # Express routers
│   │   ├── services/      # Business logic
│   │   ├── utils/         # JWT, email, error classes, async handler
│   │   ├── validators/    # Zod schemas
│   │   ├── app.js         # Express app setup
│   │   └── server.js      # Entry point
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── .env
└── inventory-frontend/
    └── src/
        ├── app/
        │   ├── login/     # Login page
        │   ├── register/  # Register page
        │   ├── verify/    # Email verification page
        │   ├── dashboard/ # Inventory table
        │   └── account/   # Change username / password
        └── lib/
            └── authFetch.ts  # Fetch wrapper with auto token refresh
```

---

## How a Request Works

Every authenticated request goes through this chain:

```
Request → Rate Limiter → Auth Middleware → Validate → Controller → Service → Database
```

1. **Rate Limiter** — blocks if too many requests
2. **Auth Middleware** — checks the JWT token, rejects if missing or invalid
3. **Validate** — runs the Zod schema against the request body, rejects if invalid
4. **Controller** — receives the request and calls the service
5. **Service** — contains the business logic and talks to the database
6. **Database** — MongoDB via Mongoose

---

## API Routes

### Auth — `/api/auth`
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/verify` | Verify email with code |
| POST | `/login` | Login, returns tokens |
| POST | `/refresh` | Refresh access token |

### Inventory — `/api/inventory`
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all items | Yes |
| POST | `/` | Create item | Yes |
| PUT | `/:id` | Update item | Yes |
| DELETE | `/:id` | Delete item | Yes |

### Categories — `/api/categories`
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all categories | Yes |
| POST | `/` | Create category | Yes |
| PUT | `/:id` | Update category | Yes |
| DELETE | `/:id` | Delete category | Yes |

### User — `/api/user`
| Method | Route | Description | Auth |
|---|---|---|---|
| PUT | `/change-username` | Change username | Yes |
| PUT | `/change-password` | Change password | Yes |

### Health — `/api/health`
| Method | Route | Description |
|---|---|---|
| GET | `/` | Check if the API is running |

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB running locally or via Docker

### 1. Start MongoDB with Docker
```bash
cd inventory-backend
docker compose up mongo -d
```

### 2. Set up environment variables
Copy `.env.example` to `.env` in `inventory-backend/` and fill in your values:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/inventory
JWT_SECRET=your_secret_key
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
```

### 3. Install dependencies
```bash
npm install
cd inventory-backend && npm install
cd ../inventory-frontend && npm install
```

### 4. Run the app
From the root folder:
```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- API Docs: `http://localhost:3001/api-docs`

---

## Database Models

### User
| Field | Type | Description |
|---|---|---|
| username | String | Unique, required |
| email | String | Required |
| password | String | Bcrypt hashed |
| verified | Boolean | Email verified flag |
| verificationCode | String | 6-digit code, cleared after verify |
| role | String | `admin`, `staff`, or `viewer` |

### Item
| Field | Type | Description |
|---|---|---|
| name | String | Required |
| quantity | Number | Required |
| price | Number | Required |
| categoryId | ObjectId | Optional, ref to Category |

### Category
| Field | Type | Description |
|---|---|---|
| name | String | Unique, required |
| description | String | Optional |
