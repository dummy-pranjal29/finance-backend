const rateLimit = require("express-rate-limit");

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  handler: (req, res, _next, options) => {
    console.log(`rateLimiter: blocked ${req.ip} on ${req.originalUrl}`);
    res.status(429).json(options.message);
  },
});

module.exports = { authRateLimiter };
