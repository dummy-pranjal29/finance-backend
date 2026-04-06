const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config/index");
const userRoutes = require("./modules/user/user.routes");
const authRoutes = require("./modules/auth/auth.routes");
const financeRoutes = require("./modules/finance/finance.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const auditRoutes = require("./modules/audit/audit.routes");
const profileRoutes = require("./modules/profile/profile.routes");
const budgetRoutes = require("./modules/budget/budget.routes");
const exportRoutes = require("./modules/export/export.routes");
const { authRateLimiter } = require("./middlewares/rateLimiter.middleware");

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  console.log("Health check hit");
  res.status(200).json({ status: "ok", message: "Finance API is running" });
});

app.get("/", (_req, res) => {
  res.status(200).json({
    name: "Finance Dashboard API",
    version: "1.0.0",
    status: "live",
    description: "A role-based finance management backend supporting financial records, dashboard analytics, budget tracking, and audit logging.",
    github: "https://github.com/dummy-pranjal29/finance-backend",
    documentation: "https://github.com/dummy-pranjal29/finance-backend/blob/master/API_DOCS.md",
    roles: ["viewer", "analyst", "admin"],
    endpoints: {
      auth: {
        "POST /api/auth/register": "Create a new account",
        "POST /api/auth/login": "Login and receive a JWT token",
        "GET /api/auth/me": "Get logged-in user profile"
      },
      users: {
        "POST /api/users": "Create a user (admin)",
        "GET /api/users": "List all users (admin, analyst)",
        "GET /api/users/:id": "Get user by ID (admin, analyst)",
        "PATCH /api/users/:id/role": "Update user role (admin)",
        "PATCH /api/users/:id/status": "Activate or deactivate user (admin)",
        "DELETE /api/users/:id": "Delete user (admin)"
      },
      profile: {
        "GET /api/profile": "Get own profile",
        "PUT /api/profile": "Update own name or email",
        "PUT /api/profile/password": "Change own password"
      },
      finance: {
        "POST /api/finance": "Create a financial record (analyst, admin)",
        "GET /api/finance": "List records with filters, search, sort, pagination",
        "GET /api/finance/:id": "Get record by ID",
        "PUT /api/finance/:id": "Update a record (analyst, admin)",
        "DELETE /api/finance/:id": "Soft delete a record (admin)",
        "PATCH /api/finance/:id/restore": "Restore a soft-deleted record (admin)"
      },
      dashboard: {
        "GET /api/dashboard/summary": "Total income, expenses, and net balance",
        "GET /api/dashboard/category": "Totals grouped by category",
        "GET /api/dashboard/trends": "Monthly income vs expense trends",
        "GET /api/dashboard/recent": "Most recently entered records"
      },
      budgets: {
        "POST /api/budgets": "Create a monthly category budget (analyst, admin)",
        "GET /api/budgets": "List budgets with live utilization data",
        "GET /api/budgets/:id": "Get budget by ID with utilization",
        "PUT /api/budgets/:id": "Update budget limit (analyst, admin)",
        "DELETE /api/budgets/:id": "Delete a budget (admin)"
      },
      audit: {
        "GET /api/audit": "View audit logs for all financial record writes (admin)"
      },
      export: {
        "GET /api/export/csv": "Download records as CSV file",
        "GET /api/export/json": "Download records as JSON file"
      }
    },
    testAccounts: {
      note: "Use these credentials to test all role-based flows immediately",
      admin: {
        email: "testadmin@test.com",
        password: "newpass456",
        access: "Full access — users, finance, dashboard, budgets, audit, export"
      },
      viewer: {
        email: "viewer@test.com",
        password: "pass123",
        access: "Read-only — finance records, dashboard, own profile, export"
      }
    },
    quickStart: {
      step1: "POST /api/auth/login with admin credentials to get a token",
      step2: "Add header: Authorization: Bearer <token>",
      step3: "GET /api/dashboard/summary to see aggregated financials",
      step4: "GET /api/finance to browse all records with filters",
      step5: "GET /api/audit to view the full audit trail (admin only)"
    }
  });
});

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/export", exportRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(`Global error: ${err.message}`);

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "Duplicate entry. Resource already exists." });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;
