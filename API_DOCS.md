# API Reference

**Base URL:** `http://localhost:5000`

Protected routes require a Bearer token in the Authorization header.
```
Authorization: Bearer <token>
```

All responses follow a consistent envelope:
```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "..." }
```

---

## Health

```
GET /health
```
No auth. Returns `{ "status": "ok" }`. Used by monitoring tools to check if the server is up.

---

## Auth — /api/auth

Rate limited to **10 requests per 15 minutes** per IP on all routes in this group.

---

```
POST /api/auth/register
```
Creates a new account. Role defaults to `viewer`. Returns a JWT token on success.

```json
// request
{ "name": "Alice", "email": "alice@example.com", "password": "secret123" }

// 201 response
{ "success": true, "data": { "token": "eyJhbGc..." } }
```

Password minimum 6 characters. Returns `409` if email already registered.

---

```
POST /api/auth/login
```
Authenticates a user and returns a JWT token valid for 7 days.

```json
// request
{ "email": "alice@example.com", "password": "secret123" }

// 200 response
{ "success": true, "data": { "token": "eyJhbGc..." } }
```

Returns `401` for wrong credentials. Returns `403` if account is deactivated.

---

```
GET /api/auth/me
```
Returns the profile of the currently authenticated user. Password field is never returned.

---

## Users — /api/users

User management is admin-only except `GET /` and `GET /:id` which are also accessible to analysts.

---

```
POST /api/users
```
Admin only. Creates a user with an explicit role assignment.

```json
{ "name": "Bob", "email": "bob@example.com", "password": "secret123", "role": "analyst" }
```

---

```
GET /api/users
GET /api/users?role=analyst
GET /api/users?isActive=false
```
Returns all users. Accepts optional `role` and `isActive` query filters. Passwords are never returned.

---

```
GET /api/users/:id
```
Returns a single user by their MongoDB ID. Returns `400` for malformed IDs, `404` if not found.

---

```
PATCH /api/users/:id/role
```
Admin only. Updates a user's role.

```json
{ "role": "analyst" }   // "viewer" | "analyst" | "admin"
```

---

```
PATCH /api/users/:id/status
```
Admin only. Activates or deactivates a user account. Deactivated users cannot log in.

```json
{ "isActive": false }
```

---

```
DELETE /api/users/:id
```
Admin only. Permanently removes a user from the database.

---

## Profile — /api/profile

Self-service routes. Always operate on the currently authenticated user. No `:id` parameter — you cannot modify another user's profile through these routes.

---

```
GET /api/profile
```
Returns the authenticated user's full profile.

---

```
PUT /api/profile
```
Updates name and/or email. Returns `409` if the new email belongs to someone else.

```json
{ "name": "Alice Smith" }
{ "email": "alice.new@example.com" }
{ "name": "Alice Smith", "email": "alice.new@example.com" }
```

---

```
PUT /api/profile/password
```
Changes password. Requires the current password to be provided — prevents account takeover via stolen tokens.

```json
{ "currentPassword": "secret123", "newPassword": "newsecret456" }
```

Returns `401` if `currentPassword` is incorrect.

---

## Financial Records — /api/finance

---

```
POST /api/finance
```
Analyst, Admin. Creates a financial record. The `createdBy` field is set from the JWT — clients cannot spoof this.

```json
{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2024-01-15",
  "notes": "January salary"
}
```

`type` must be `income` or `expense`. `amount` must be greater than 0. `date` must be a valid ISO date.

---

```
GET /api/finance
```
All roles. Returns paginated records. All filters are optional and composable.

```
?type=expense
?category=food                         case-insensitive match
?startDate=2024-01-01
?endDate=2024-01-31
?minAmount=500
?maxAmount=5000
?search=rent                           searches notes and category
?sortBy=amount&sortOrder=asc           sortBy: date | amount | createdAt
?createdBy=<userId>                    admin/analyst only
?page=2&limit=5
```

Response includes a `pagination` object with `total`, `page`, `limit`, and `totalPages`.

---

```
GET /api/finance/:id
PUT /api/finance/:id
DELETE /api/finance/:id
```

`GET` — all roles.
`PUT` — analyst, admin. Updates any combination of fields. Only provided fields are changed.
`DELETE` — admin only. **Soft deletes** the record — it is hidden from all queries but preserved in the database. Returns `200`, not `204`.

---

```
PATCH /api/finance/:id/restore
```
Admin only. Restores a soft-deleted record. Returns `400` if the record is not currently deleted.

---

## Dashboard — /api/dashboard

All routes are accessible to every role. Viewers are automatically scoped to their own records — the server enforces this regardless of what query params are sent.

### Shared query params across all dashboard routes

```bash
?startDate=2024-01-01    scope results to records on or after this date
?endDate=2024-12-31      scope results to records on or before this date
?userId=<id>             admin/analyst only — scope to a specific user's records
```

Passing `userId` as a viewer returns `403`.

---

```
GET /api/dashboard/summary
```

```json
{
  "totalIncome": 13000,
  "totalExpenses": 2500,
  "netBalance": 10500,
  "incomeCount": 3,
  "expenseCount": 5
}
```

---

```bash
GET /api/dashboard/category
GET /api/dashboard/category?type=expense
```

Totals per category, sorted by total descending. Optional `type` filter.

```json
[
  { "category": "salary", "type": "income", "total": 10000, "count": 2 },
  { "category": "rent",   "type": "expense", "total": 1500,  "count": 1 }
]
```

---

```bash
GET /api/dashboard/trends
```

Monthly income vs expense breakdown. Each entry represents one calendar month.

```json
[
  { "month": "2024-01", "income": 5000, "expenses": 1200, "net": 3800 },
  { "month": "2024-02", "income": 8000, "expenses": 1300, "net": 6700 }
]
```

---

```bash
GET /api/dashboard/recent
GET /api/dashboard/recent?limit=10
```

Most recently entered records. Defaults to 5. Sorted by entry time, not transaction date.

---

## Budgets — /api/budgets

Per-user, per-category, per-month spending limits. Every response includes live utilization computed by aggregating actual expense records for that category and month.

---

```bash
POST /api/budgets
```

Analyst, Admin. One budget per user per category per month — duplicate returns `409`.

```json
{ "category": "food", "month": "2024-01", "limit": 1500 }
```

`month` must follow `YYYY-MM` format. `limit` must be greater than 0.

---

```bash
GET /api/budgets
GET /api/budgets?month=2024-01
```

All roles. Returns your own budgets with live utilization.

```json
{
  "category": "food",
  "month": "2024-01",
  "limit": 1500,
  "spent": 1200,
  "remaining": 300,
  "percentUsed": 80.00
}
```

`percentUsed` exceeds 100 when spending is over budget. `remaining` is floored at 0.

---

```bash
GET /api/budgets/:id
PUT /api/budgets/:id
DELETE /api/budgets/:id
```

`GET` — all roles, returns with utilization.
`PUT` — analyst, admin. Only `limit` can be updated.
`DELETE` — admin only.

---

## Audit Logs — /api/audit

Admin only. Append-only log of all write operations on financial records. Logs are never modified or deleted.

---

```bash
GET /api/audit
GET /api/audit?action=DELETE
GET /api/audit?entityId=<financeRecordId>
GET /api/audit?page=1&limit=20
```

Each log entry records: `action` (CREATE / UPDATE / DELETE / RESTORE), `entity`, `entityId`, `performedBy` (populated with name and email), `changes` (snapshot of what was written), and `createdAt`.

---

## Export — /api/export

All roles. Supports the same filters as `GET /api/finance` (type, category, startDate, endDate). Returns `404` if no records match the filter.

---

```bash
GET /api/export/csv
```

Downloads a `.csv` file. Filename includes a timestamp so repeated exports do not overwrite each other. Notes field is properly escaped for CSV.

```text
amount,type,category,date,notes,createdBy
5000,income,salary,2024-01-15,January salary,Alice
1200,expense,rent,2024-01-01,,Alice
```

---

```bash
GET /api/export/json
```

Downloads a `.json` file with `total`, `exportedAt`, and the full `records` array.

---

## Error Codes

```text
400   Bad request — failed validation, invalid MongoDB ID format
401   Unauthenticated — missing token, expired token, wrong password
403   Forbidden — authenticated but role does not permit this action
404   Not found — resource does not exist or has been soft-deleted
409   Conflict — duplicate resource (email, budget for same category+month)
429   Rate limit exceeded — too many auth requests from this IP
500   Internal server error — something unexpected failed
```
