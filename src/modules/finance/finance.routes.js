const express = require("express");
const router = express.Router();
const {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require("./finance.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");

router.post("/", authenticate, authorize("admin", "analyst"), createRecord);
router.get("/", authenticate, authorize("admin", "analyst", "viewer"), getAllRecords);
router.get("/:id", authenticate, authorize("admin", "analyst", "viewer"), getRecordById);
router.put("/:id", authenticate, authorize("admin", "analyst"), updateRecord);
router.delete("/:id", authenticate, authorize("admin"), deleteRecord);

module.exports = router;
