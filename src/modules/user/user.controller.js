const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./user.model");
const { sendSuccess } = require("../../utils/response");
const AppError = require("../../utils/AppError");
const asyncHandler = require("../../utils/asyncHandler");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError("A user with this email already exists", 409);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role });

  console.log(`createUser: ${user.email} | role: ${user.role}`);

  const userObj = user.toObject();
  delete userObj.password;

  return sendSuccess(res, userObj, "User created successfully", 201);
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

  const users = await User.find(filter).select("-password");

  console.log(`getAllUsers: returned ${users.length} users`);

  return sendSuccess(res, users, "Users fetched successfully");
});

exports.getUserById = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) throw new AppError("Invalid user ID format", 400);

  const user = await User.findById(req.params.id).select("-password");
  if (!user) throw new AppError("User not found", 404);

  console.log(`getUserById: fetched user ${user.email}`);

  return sendSuccess(res, user, "User fetched successfully");
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) throw new AppError("Invalid user ID format", 400);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  ).select("-password");

  if (!user) throw new AppError("User not found", 404);

  console.log(`updateUserRole: ${user.email} role set to ${user.role}`);

  return sendSuccess(res, user, "User role updated successfully");
});

exports.updateUserStatus = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) throw new AppError("Invalid user ID format", 400);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  ).select("-password");

  if (!user) throw new AppError("User not found", 404);

  console.log(`updateUserStatus: ${user.email} isActive set to ${user.isActive}`);

  return sendSuccess(res, user, "User status updated successfully");
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) throw new AppError("Invalid user ID format", 400);

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError("User not found", 404);

  console.log(`deleteUser: ${user.email} deleted`);

  return sendSuccess(res, null, "User deleted successfully");
});
