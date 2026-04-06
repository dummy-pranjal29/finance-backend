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
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Finance Dashboard API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f1117; color: #e2e8f0; min-height: 100vh; padding: 40px 20px; }
    .container { max-width: 860px; margin: 0 auto; }
    .header { margin-bottom: 40px; }
    .badge { display: inline-block; background: #22c55e20; color: #22c55e; border: 1px solid #22c55e40; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 16px; }
    h1 { font-size: 32px; font-weight: 700; color: #f8fafc; margin-bottom: 8px; }
    .subtitle { color: #94a3b8; font-size: 15px; line-height: 1.6; max-width: 600px; }
    .links { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
    .link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; transition: opacity 0.2s; }
    .link:hover { opacity: 0.8; }
    .link-github { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }
    .link-docs { background: #1e3a5f; color: #93c5fd; border: 1px solid #1d4ed840; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #1e293b; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; }
    .card-title { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #60a5fa; margin-bottom: 10px; }
    .endpoint { display: flex; align-items: flex-start; gap: 8px; padding: 5px 0; border-bottom: 1px solid #0f172a; font-size: 13px; }
    .endpoint:last-child { border-bottom: none; }
    .method { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; min-width: 42px; text-align: center; margin-top: 1px; flex-shrink: 0; }
    .get { background: #14532d; color: #86efac; }
    .post { background: #1e3a5f; color: #93c5fd; }
    .put { background: #451a03; color: #fdba74; }
    .patch { background: #3b0764; color: #d8b4fe; }
    .delete { background: #450a0a; color: #fca5a5; }
    .ep-text { color: #cbd5e1; line-height: 1.4; }
    .ep-desc { color: #64748b; font-size: 11px; margin-top: 1px; }
    .accounts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 600px) { .accounts { grid-template-columns: 1fr; } }
    .account-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; }
    .account-role { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px; }
    .admin-role { color: #f87171; }
    .viewer-role { color: #34d399; }
    .cred { font-size: 13px; color: #94a3b8; margin-bottom: 4px; }
    .cred span { color: #e2e8f0; font-family: 'Courier New', monospace; background: #0f172a; padding: 1px 6px; border-radius: 4px; }
    .access-note { font-size: 11px; color: #64748b; margin-top: 8px; line-height: 1.4; }
    .steps { display: flex; flex-direction: column; gap: 8px; }
    .step { display: flex; align-items: flex-start; gap: 12px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px 14px; }
    .step-num { background: #3b82f620; color: #60a5fa; border: 1px solid #3b82f640; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
    .step-text { font-size: 13px; color: #94a3b8; line-height: 1.5; }
    .step-text code { color: #e2e8f0; background: #0f172a; padding: 1px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">&#x25cf; LIVE</div>
      <h1>Finance Dashboard API</h1>
      <p class="subtitle">A role-based finance management backend supporting financial records, dashboard analytics, budget tracking, and audit logging.</p>
      <div class="links">
        <a class="link link-github" href="https://github.com/dummy-pranjal29/finance-backend" target="_blank">&#128279; GitHub Repository</a>
        <a class="link link-docs" href="https://github.com/dummy-pranjal29/finance-backend/blob/master/API_DOCS.md" target="_blank">&#128196; API Documentation</a>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Test Accounts</div>
      <div class="accounts">
        <div class="account-card">
          <div class="account-role admin-role">&#9679; Admin</div>
          <div class="cred">Email: <span>testadmin@test.com</span></div>
          <div class="cred">Password: <span>newpass456</span></div>
          <div class="access-note">Full access — users, finance, dashboard, budgets, audit logs, export</div>
        </div>
        <div class="account-card">
          <div class="account-role viewer-role">&#9679; Viewer</div>
          <div class="cred">Email: <span>viewer@test.com</span></div>
          <div class="cred">Password: <span>pass123</span></div>
          <div class="access-note">Read-only — finance records, dashboard summaries, own profile, export</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Quick Start</div>
      <div class="steps">
        <div class="step"><div class="step-num">1</div><div class="step-text">Login — <code>POST /api/auth/login</code> with admin credentials above to get a JWT token</div></div>
        <div class="step"><div class="step-num">2</div><div class="step-text">Authorize — add header <code>Authorization: Bearer &lt;token&gt;</code> to every request</div></div>
        <div class="step"><div class="step-num">3</div><div class="step-text">Explore — try <code>GET /api/dashboard/summary</code> for totals or <code>GET /api/finance</code> for all records</div></div>
        <div class="step"><div class="step-num">4</div><div class="step-text">Audit trail — <code>GET /api/audit</code> shows every write operation ever performed (admin only)</div></div>
        <div class="step"><div class="step-num">5</div><div class="step-text">Export — <code>GET /api/export/csv</code> downloads all records as a spreadsheet file</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Endpoints</div>
      <div class="grid">
        <div class="card">
          <div class="card-title">Auth</div>
          <div class="endpoint"><span class="method post">POST</span><div class="ep-text">/api/auth/register<div class="ep-desc">Create a new account</div></div></div>
          <div class="endpoint"><span class="method post">POST</span><div class="ep-text">/api/auth/login<div class="ep-desc">Get JWT token</div></div></div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/auth/me<div class="ep-desc">Get own profile</div></div></div>
        </div>
        <div class="card">
          <div class="card-title">Profile</div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/profile<div class="ep-desc">Get own profile</div></div></div>
          <div class="endpoint"><span class="method put">PUT</span><div class="ep-text">/api/profile<div class="ep-desc">Update name or email</div></div></div>
          <div class="endpoint"><span class="method put">PUT</span><div class="ep-text">/api/profile/password<div class="ep-desc">Change password</div></div></div>
        </div>
        <div class="card">
          <div class="card-title">Users — Admin</div>
          <div class="endpoint"><span class="method post">POST</span><div class="ep-text">/api/users<div class="ep-desc">Create user</div></div></div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/users<div class="ep-desc">List all users</div></div></div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/users/:id<div class="ep-desc">Get user by ID</div></div></div>
          <div class="endpoint"><span class="method patch">PATCH</span><div class="ep-text">/api/users/:id/role<div class="ep-desc">Update role</div></div></div>
          <div class="endpoint"><span class="method patch">PATCH</span><div class="ep-text">/api/users/:id/status<div class="ep-desc">Activate / deactivate</div></div></div>
          <div class="endpoint"><span class="method delete">DELETE</span><div class="ep-text">/api/users/:id<div class="ep-desc">Delete user</div></div></div>
        </div>
        <div class="card">
          <div class="card-title">Financial Records</div>
          <div class="endpoint"><span class="method post">POST</span><div class="ep-text">/api/finance<div class="ep-desc">Create record</div></div></div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/finance<div class="ep-desc">List with filters, search, sort</div></div></div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/finance/:id<div class="ep-desc">Get by ID</div></div></div>
          <div class="endpoint"><span class="method put">PUT</span><div class="ep-text">/api/finance/:id<div class="ep-desc">Update record</div></div></div>
          <div class="endpoint"><span class="method delete">DELETE</span><div class="ep-text">/api/finance/:id<div class="ep-desc">Soft delete</div></div></div>
          <div class="endpoint"><span class="method patch">PATCH</span><div class="ep-text">/api/finance/:id/restore<div class="ep-desc">Restore deleted record</div></div></div>
        </div>
        <div class="card">
          <div class="card-title">Dashboard</div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/dashboard/summary<div class="ep-desc">Income, expenses, net balance</div></div></div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/dashboard/category<div class="ep-desc">Totals by category</div></div></div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/dashboard/trends<div class="ep-desc">Monthly trends</div></div></div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/dashboard/recent<div class="ep-desc">Recent activity</div></div></div>
        </div>
        <div class="card">
          <div class="card-title">Budgets</div>
          <div class="endpoint"><span class="method post">POST</span><div class="ep-text">/api/budgets<div class="ep-desc">Create monthly budget</div></div></div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/budgets<div class="ep-desc">List with live utilization</div></div></div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/budgets/:id<div class="ep-desc">Get with utilization</div></div></div>
          <div class="endpoint"><span class="method put">PUT</span><div class="ep-text">/api/budgets/:id<div class="ep-desc">Update limit</div></div></div>
          <div class="endpoint"><span class="method delete">DELETE</span><div class="ep-text">/api/budgets/:id<div class="ep-desc">Delete budget</div></div></div>
        </div>
        <div class="card">
          <div class="card-title">Audit Logs — Admin</div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/audit<div class="ep-desc">All write operation logs with filters</div></div></div>
        </div>
        <div class="card">
          <div class="card-title">Export</div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/export/csv<div class="ep-desc">Download as CSV file</div></div></div>
          <div class="endpoint"><span class="method get">GET</span><div class="ep-text">/api/export/json<div class="ep-desc">Download as JSON file</div></div></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`);
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
