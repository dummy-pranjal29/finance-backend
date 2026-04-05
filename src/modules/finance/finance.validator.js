const { body } = require("express-validator");

const createRecordValidator = [
  body("amount").isFloat({ gt: 0 }).withMessage("amount must be a number greater than 0"),
  body("type").isIn(["income", "expense"]).withMessage("type must be income or expense"),
  body("category").trim().notEmpty().withMessage("category is required"),
  body("date").isISO8601().withMessage("date must be a valid date in YYYY-MM-DD format"),
  body("notes").optional().isString().withMessage("notes must be a string"),
];

const updateRecordValidator = [
  body("amount").optional().isFloat({ gt: 0 }).withMessage("amount must be a number greater than 0"),
  body("type").optional().isIn(["income", "expense"]).withMessage("type must be income or expense"),
  body("category").optional().trim().notEmpty().withMessage("category cannot be empty"),
  body("date").optional().isISO8601().withMessage("date must be a valid date in YYYY-MM-DD format"),
  body("notes").optional().isString().withMessage("notes must be a string"),
];

module.exports = { createRecordValidator, updateRecordValidator };
