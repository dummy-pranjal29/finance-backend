const { sendError } = require("../utils/response");

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Unauthorized. Please login first.", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`authorize: access denied for role "${req.user.role}" on ${req.method} ${req.originalUrl}`);
      return sendError(res, "Forbidden. You do not have permission to perform this action.", 403);
    }

    console.log(`authorize: role "${req.user.role}" granted access to ${req.method} ${req.originalUrl}`);
    next();
  };
};

module.exports = { authorize };
