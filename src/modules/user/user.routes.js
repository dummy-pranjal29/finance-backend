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

router.post("/", authenticate, authorize("admin"), createUser);
router.get("/", authenticate, authorize("admin", "analyst"), getAllUsers);
router.get("/:id", authenticate, authorize("admin", "analyst"), getUserById);
router.patch("/:id/role", authenticate, authorize("admin"), updateUserRole);
router.patch("/:id/status", authenticate, authorize("admin"), updateUserStatus);
router.delete("/:id", authenticate, authorize("admin"), deleteUser);

module.exports = router;
