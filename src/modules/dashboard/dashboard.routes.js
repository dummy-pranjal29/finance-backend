const express = require("express");
const router = express.Router();
const {
  getSummary,
  getCategoryTotals,
  getTrends,
  getRecentActivity,
} = require("./dashboard.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");

const allRoles = authorize("admin", "analyst", "viewer");

router.get("/summary", authenticate, allRoles, getSummary);
router.get("/category", authenticate, allRoles, getCategoryTotals);
router.get("/trends", authenticate, allRoles, getTrends);
router.get("/recent", authenticate, allRoles, getRecentActivity);

module.exports = router;
