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
const { validate } = require("../../middlewares/validate.middleware");
const { createRecordValidator, updateRecordValidator } = require("./finance.validator");

router.post("/", authenticate, authorize("admin", "analyst"), createRecordValidator, validate, createRecord);
router.get("/", authenticate, authorize("admin", "analyst", "viewer"), getAllRecords);
router.get("/:id", authenticate, authorize("admin", "analyst", "viewer"), getRecordById);
router.put("/:id", authenticate, authorize("admin", "analyst"), updateRecordValidator, validate, updateRecord);
router.delete("/:id", authenticate, authorize("admin"), deleteRecord);

module.exports = router;
