const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config/index");
const userRoutes = require("./modules/user/user.routes");
const authRoutes = require("./modules/auth/auth.routes");
const financeRoutes = require("./modules/finance/finance.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
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

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/dashboard", dashboardRoutes);

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

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;
