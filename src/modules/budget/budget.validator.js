const { body } = require("express-validator");

const createBudgetValidator = [
  body("category").trim().notEmpty().withMessage("category is required"),
  body("month")
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage("month must be in YYYY-MM format (e.g. 2024-01)"),
  body("limit").isFloat({ gt: 0 }).withMessage("limit must be a number greater than 0"),
];

const updateBudgetValidator = [
  body("limit").isFloat({ gt: 0 }).withMessage("limit must be a number greater than 0"),
];

module.exports = { createBudgetValidator, updateBudgetValidator };
