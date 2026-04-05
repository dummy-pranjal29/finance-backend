const { body } = require("express-validator");

const createUserValidator = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").trim().isEmail().withMessage("a valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
  body("role").optional().isIn(["viewer", "analyst", "admin"]).withMessage("role must be viewer, analyst, or admin"),
];

const updateRoleValidator = [
  body("role").isIn(["viewer", "analyst", "admin"]).withMessage("role must be viewer, analyst, or admin"),
];

const updateStatusValidator = [
  body("isActive").isBoolean().withMessage("isActive must be a boolean"),
];

module.exports = { createUserValidator, updateRoleValidator, updateStatusValidator };
