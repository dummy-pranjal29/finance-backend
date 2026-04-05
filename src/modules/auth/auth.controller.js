const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../user/user.model");
const { sendSuccess } = require("../../utils/response");
const AppError = require("../../utils/AppError");
const asyncHandler = require("../../utils/asyncHandler");
const config = require("../../config/index");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError("A user with this email already exists", 409);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  const token = generateToken(user);

  console.log(`Register: new user ${user.email} | role: ${user.role}`);

  return sendSuccess(res, { token }, "Registration successful", 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid credentials", 401);

  if (!user.isActive) throw new AppError("Account is deactivated", 403);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);

  const token = generateToken(user);

  console.log(`Login: ${user.email} authenticated | role: ${user.role}`);

  return sendSuccess(res, { token }, "Login successful");
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) throw new AppError("User not found", 404);

  console.log(`getMe: ${user.email} fetched their profile`);

  return sendSuccess(res, user, "Profile fetched successfully");
});
