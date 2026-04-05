const { body } = require("express-validator");

const registerValidator = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").trim().isEmail().withMessage("a valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
];

const loginValidator = [
  body("email").trim().isEmail().withMessage("a valid email is required"),
  body("password").notEmpty().withMessage("password is required"),
];

module.exports = { registerValidator, loginValidator };
