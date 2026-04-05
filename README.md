# Finance Dashboard Backend

A production-grade REST API backend for a finance dashboard system. Built with Node.js, Express, and MongoDB. Supports role-based access control, financial record management, dashboard aggregations, budget tracking, audit logging, and data export.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB Atlas (Mongoose 9) |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Validation | express-validator |
| Security | helmet, cors, express-rate-limit |
| Logging | morgan |

---

## Project Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── index.js            # Centralized environment config
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── rbac.middleware.js       # Role-based access control
│   │   ├── validate.middleware.js   # express-validator error extractor
│   │   └── rateLimiter.middleware.js # Auth route rate limiting
│   ├── modules/
│   │   ├── auth/               # Register, login, profile
│   │   ├── user/               # User management (admin)
│   │   ├── finance/            # Financial records CRUD
│   │   ├── dashboard/          # Aggregation and summary APIs
│   │   ├── budget/             # Budget management with utilization
│   │   ├── audit/              # Audit log viewer
│   │   ├── profile/            # Self-service profile update
│   │   └── export/             # CSV and JSON export
│   ├── utils/
│   │   ├── response.js         # Consistent API response helpers
│   │   ├── AppError.js         # Custom operational error class
│   │   └── asyncHandler.js     # Async route pass-through (Express 5)
│   ├── app.js                  # Express app setup, middleware, routes
│   └── server.js               # Server entry point
├── .env                        # Environment variables (not committed)
├── .gitignore
└── package.json
```

---

## Local Setup

**1. Clone the repository**
```bash
git clone https://github.com/dummy-pranjal29/finance-backend.git
cd finance-backend
```

**2. Install dependencies**
```bash
npm install
```

**3. Create a `.env` file** in the root directory:
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/finance-db
JWT_SECRET=your_secret_key_here
NODE_ENV=development
CORS_ORIGIN=*
```

**4. Start the server**
```bash
npm run dev       # development with nodemon
npm start         # production
```

**5. Verify it is running**
```
GET http://localhost:5000/health
```
Expected response:
```json
{ "status": "ok", "message": "Finance API is running" }
```

---

## Roles and Permissions

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| Register / Login | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Update own profile / password | ✅ | ✅ | ✅ |
| View financial records | ✅ | ✅ | ✅ |
| Create / Update financial records | ❌ | ✅ | ✅ |
| Delete financial records | ❌ | ❌ | ✅ |
| Restore soft-deleted records | ❌ | ❌ | ✅ |
| View dashboard summaries | ✅ | ✅ | ✅ |
| Export records (CSV / JSON) | ✅ | ✅ | ✅ |
| View budgets | ✅ | ✅ | ✅ |
| Create / Update budgets | ❌ | ✅ | ✅ |
| Delete budgets | ❌ | ❌ | ✅ |
| View all users | ❌ | ✅ | ✅ |
| Create users / Manage roles | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |

---

## API Response Format

Every API response follows this consistent shape:

**Success**
```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": { }
}
```

**Error**
```json
{
  "success": false,
  "message": "A user with this email already exists"
}
```

---

## Assumptions Made

1. **First admin setup** — The first admin user must be promoted manually via MongoDB Atlas since there is no open admin creation endpoint. All subsequent role changes can be done through `PATCH /api/users/:id/role` by an admin.

2. **Soft delete scope** — Only financial records are soft-deleted. Users are hard-deleted as user deletion is an admin-only operation with intentional finality.

3. **Budget utilization** — Budget tracking is per-user, per-category, per-month. Utilization is computed live on every request by aggregating actual expense records. It supports over-budget reporting (percentUsed can exceed 100).

4. **Viewer dashboard scoping** — Viewers automatically see only their own financial data in all dashboard routes. Admins and analysts see all data by default and can optionally scope by `userId`.

5. **Audit logging** — Only financial record operations (CREATE, UPDATE, DELETE, RESTORE) are audited. User management changes are not audited in the current implementation.

6. **Token expiry** — JWT tokens expire in 7 days. There is no refresh token mechanism. Users must log in again after expiry.

7. **Rate limiting** — Applied only to `/api/auth` routes (10 requests per 15 minutes per IP) to protect against brute force attacks on login.

---

## Optional Enhancements Implemented

| Enhancement | Details |
|---|---|
| JWT Authentication | Register, login, protected routes |
| Pagination | All list endpoints with `page` and `limit` params |
| Search | Keyword search on notes and category |
| Soft Delete | Financial records hidden but preserved, restorable |
| Rate Limiting | 10 requests per 15 min on auth routes |
| Audit Logging | Append-only log for all financial record writes |
| Budget Tracking | Per-category monthly budgets with live utilization |
| Data Export | CSV and JSON download with filters |
| Security Headers | helmet for HTTP security headers |
| Input Validation | express-validator on all write endpoints |
| Centralized Error Handling | Global error handler with AppError class |
