const express = require("express");
const router = express.Router();
const {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} = require("./budget.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const { createBudgetValidator, updateBudgetValidator } = require("./budget.validator");

router.post("/", authenticate, authorize("admin", "analyst"), createBudgetValidator, validate, createBudget);
router.get("/", authenticate, authorize("admin", "analyst", "viewer"), getAllBudgets);
router.get("/:id", authenticate, authorize("admin", "analyst", "viewer"), getBudgetById);
router.put("/:id", authenticate, authorize("admin", "analyst"), updateBudgetValidator, validate, updateBudget);
router.delete("/:id", authenticate, authorize("admin"), deleteBudget);

module.exports = router;
