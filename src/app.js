const express = require("express");
const userRoutes = require("./modules/user/user.routes");

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  console.log("Health check hit");
  res.status(200).json({ status: "ok", message: "Finance API is running" });
});

app.use("/api/users", userRoutes);

module.exports = app;
