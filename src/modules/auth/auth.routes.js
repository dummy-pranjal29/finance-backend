const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("./auth.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const { registerValidator, loginValidator } = require("./auth.validator");

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", authenticate, getMe);

module.exports = router;
