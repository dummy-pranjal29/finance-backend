const { body } = require("express-validator");

const updateProfileValidator = [
  body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
  body("email").optional().trim().isEmail().withMessage("a valid email is required"),
];

const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("currentPassword is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("newPassword must be at least 6 characters"),
];

module.exports = { updateProfileValidator, changePasswordValidator };
