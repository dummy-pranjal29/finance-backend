const express = require("express");
const userRoutes = require("./modules/user/user.routes");
const authRoutes = require("./modules/auth/auth.routes");
const financeRoutes = require("./modules/finance/finance.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  console.log("Health check hit");
  res.status(200).json({ status: "ok", message: "Finance API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;
