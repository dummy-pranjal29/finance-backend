const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("./audit.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");

router.get("/", authenticate, authorize("admin"), getAuditLogs);

module.exports = router;
