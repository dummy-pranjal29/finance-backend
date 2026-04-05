const express = require("express");
const router = express.Router();
const { exportCSV, exportJSON } = require("./export.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");

const allRoles = authorize("admin", "analyst", "viewer");

router.get("/csv", authenticate, allRoles, exportCSV);
router.get("/json", authenticate, allRoles, exportJSON);

module.exports = router;
