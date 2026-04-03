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

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id/role", updateUserRole);
router.patch("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

module.exports = router;
