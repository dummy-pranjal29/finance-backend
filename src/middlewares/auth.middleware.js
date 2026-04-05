const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/response");
const config = require("../config/index");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Access denied. No token provided.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    console.log(`authenticate: ${req.user.id} | role: ${req.user.role} | ${req.method} ${req.originalUrl}`);
    next();
  } catch (error) {
    console.error(`authenticate error: ${error.message}`);
    return sendError(res, "Invalid or expired token", 401);
  }
};

module.exports = { authenticate };
