const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require("./profile.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const { updateProfileValidator, changePasswordValidator } = require("./profile.validator");

router.get("/", authenticate, getProfile);
router.put("/", authenticate, updateProfileValidator, validate, updateProfile);
router.put("/password", authenticate, changePasswordValidator, validate, changePassword);

module.exports = router;
