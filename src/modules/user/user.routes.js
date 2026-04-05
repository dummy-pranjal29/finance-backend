const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} = require("./user.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const { createUserValidator, updateRoleValidator, updateStatusValidator } = require("./user.validator");

router.post("/", authenticate, authorize("admin"), createUserValidator, validate, createUser);
router.get("/", authenticate, authorize("admin", "analyst"), getAllUsers);
router.get("/:id", authenticate, authorize("admin", "analyst"), getUserById);
router.patch("/:id/role", authenticate, authorize("admin"), updateRoleValidator, validate, updateUserRole);
router.patch("/:id/status", authenticate, authorize("admin"), updateStatusValidator, validate, updateUserStatus);
router.delete("/:id", authenticate, authorize("admin"), deleteUser);

module.exports = router;
