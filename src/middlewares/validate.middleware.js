const { validationResult } = require("express-validator");
const { sendError } = require("../utils/response");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    console.log(`validate: failed with errors: ${messages.join(", ")}`);
    return sendError(res, messages[0], 400);
  }

  next();
};

module.exports = { validate };
