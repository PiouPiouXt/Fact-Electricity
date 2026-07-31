# Server — Fact Electricity Backend

## Overview

Express.js API server that provides authentication, data persistence, and
calculation endpoints for the Fact Electricity frontend. Built with SQLite
(file-based, no external DB required), JWT auth, and bcryptjs password hashing.

## Architecture

```
server/
├── index.js                    # Express app entry point
├── config/
│   └── database.js             # SQLite connection + schema initialization
├── middleware/
│   ├── auth.js                 # JWT verification, attaches req.user
│   └── errorHandler.js         # Centralized error handling
├── utils/
│   └── electricity.js          # Tariff constants + calcBill + calcInverse
├── models/
│   ├── userModel.js            # User CRUD (email, password_hash)
│   ├── deviceModel.js          # Custom device CRUD (user-scoped)
│   ├── usageModel.js           # Device usage times persistence
│   ├── historyModel.js         # Monthly history CRUD
│   └── settingsModel.js        # User settings (theme, currency, language)
├── controllers/
│   ├── authController.js       # register, login, logout, me
│   ├── deviceController.js     # list built-in + custom devices
│   ├── usageController.js      # get / save device usage hours
│   ├── calcController.js       # bill calculation + inverse allocation
│   ├── historyController.js    # CRUD monthly history entries
│   └── settingsController.js   # get / update user settings
└── routes/
    ├── auth.js                 # /api/auth/*
    ├── devices.js              # /api/devices/*
    ├── usage.js                # /api/usage
    ├── calc.js                 # /api/calc/*
    ├── history.js              # /api/history/*
    └── settings.js             # /api/settings
```

## Database Schema (SQLite)

| Table             | Columns                                                                 |
|-------------------|---------------------------------------------------------------------------|
| `users`           | id, email (unique), password_hash, name, created_at, updated_at           |
| `devices`         | id, user_id (FK), name, watts, icon, created_at                           |
| `device_times`    | id, user_id (FK), device_key, hours, created_at, updated_at               |
| `monthly_history` | id, user_id (FK), month, year, cost, kwh, is_auto, created_at             |
| `settings`        | user_id (PK, FK), theme, currency, language, updated_at                   |

## API Endpoints

All endpoints (except auth) require `Authorization: Bearer <jwt>` header.

### Auth (`/api/auth`)
| Method | Path       | Body                  | Description              |
|--------|------------|-----------------------|--------------------------|
| POST   | `/register`| email, password, name | Register new user        |
| POST   | `/login`   | email, password       | Login, returns JWT       |
| POST   | `/logout`  | —                     | Invalidate token (client)|
| GET    | `/me`      | —                     | Get current user profile |

### Devices (`/api/devices`)
| Method | Path              | Body                          | Description                     |
|--------|-------------------|-------------------------------|---------------------------------|
| GET    | `/`               | —                             | Built-in APPS catalogue         |
| GET    | `/custom`         | —                             | User's custom devices           |
| POST   | `/custom`         | name, watts, icon             | Add custom device               |
| DELETE | `/custom/:id`     | —                             | Delete custom device            |

### Usage (`/api/usage`)
| Method | Path   | Body                          | Description                         |
|--------|--------|-------------------------------|-------------------------------------|
| GET    | `/`    | —                             | Get all device usage times          |
| PUT    | `/`    | { times: {deviceKey: hours} } | Save all device usage times         |

### Calculations (`/api/calc`)
| Method | Path           | Body                  | Description                          |
|--------|----------------|-----------------------|--------------------------------------|
| POST   | `/bill`        | kwh                   | Calculate bill from kWh (tiered)     |
| POST   | `/inverse`     | budget                | Inverse: budget → suggested hours    |
| POST   | `/total`       | times, customs        | Total kWh from device usage          |

### History (`/api/history`)
| Method | Path         | Body                    | Description                    |
|--------|--------------|-------------------------|--------------------------------|
| GET    | `/`          | —                       | List all monthly entries       |
| POST   | `/`          | month, year, cost, kwh  | Add month entry                |
| DELETE | `/:id`       | —                       | Delete month entry             |

### Settings (`/api/settings`)
| Method | Path   | Body                       | Description               |
|--------|--------|----------------------------|---------------------------|
| GET    | `/`    | —                          | Get user settings         |
| PUT    | `/`    | theme, currency, language  | Update user settings      |

## Development

```bash
cd server
npm install
npm run dev        # starts server on http://localhost:3001
```

Environment variables (`.env`):
```
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
DB_PATH=./data/fact_electricity.db
```

## Frontend Integration Notes

The frontend (`client/`) is a React + Vite SPA. Key integration points:

1. **Login** (`HamburgerMenu.jsx` → `Login.jsx`): Replace the mock login with
   `POST /api/auth/login`. Store JWT in `localStorage`.

2. **Calculator** (`CalcPage.jsx`): On device time change, call `PUT /api/usage`.
   On add custom device, call `POST /api/devices/custom`.

3. **Inverse Calculator** (`InversePage.jsx`): Call `POST /api/calc/inverse`
   instead of client-side `calcInverse`.

4. **Dashboard** (`DashboardPage.jsx`): Load history via `GET /api/history`.
   Save via `POST /api/history`. Delete via `DELETE /api/history/:id`.

5. **Bill Modal** (`BillModal.jsx`): Use `POST /api/calc/bill` for verification.

6. **Settings** (`HamburgerMenu.jsx`): Use `GET/PUT /api/settings`.

## Conventions

- All API responses use `{ success: true, data: ... }` or `{ success: false, error: "..." }`
- All controllers are async and wrapped in try/catch
- Passwords are hashed with bcryptjs (12 rounds)
- JWT tokens contain `{ userId, email }`
- SQLite uses parameterized queries (no SQL injection)
- CORS allows requests from `http://localhost:5173` (Vite dev server)
