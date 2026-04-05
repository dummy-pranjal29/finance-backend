const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./user.model");
const { sendSuccess, sendError } = require("../../utils/response");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, "A user with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    console.log(`createUser: ${user.email} | role: ${user.role}`);

    const userObj = user.toObject();
    delete userObj.password;

    return sendSuccess(res, userObj, "User created successfully", 201);
  } catch (error) {
    console.error(`createUser error: ${error.message}`);
    return sendError(res, "Failed to create user");
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

    const users = await User.find(filter).select("-password");

    console.log(`getAllUsers: returned ${users.length} users`);

    return sendSuccess(res, users, "Users fetched successfully");
  } catch (error) {
    console.error(`getAllUsers error: ${error.message}`);
    return sendError(res, "Failed to fetch users");
  }
};

exports.getUserById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return sendError(res, "Invalid user ID format", 400);

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    console.log(`getUserById: fetched user ${user.email}`);

    return sendSuccess(res, user, "User fetched successfully");
  } catch (error) {
    console.error(`getUserById error: ${error.message}`);
    return sendError(res, "Failed to fetch user");
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return sendError(res, "Invalid user ID format", 400);

    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    console.log(`updateUserRole: ${user.email} role set to ${user.role}`);

    return sendSuccess(res, user, "User role updated successfully");
  } catch (error) {
    console.error(`updateUserRole error: ${error.message}`);
    return sendError(res, "Failed to update user role");
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return sendError(res, "Invalid user ID format", 400);

    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    console.log(`updateUserStatus: ${user.email} isActive set to ${user.isActive}`);

    return sendSuccess(res, user, "User status updated successfully");
  } catch (error) {
    console.error(`updateUserStatus error: ${error.message}`);
    return sendError(res, "Failed to update user status");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return sendError(res, "Invalid user ID format", 400);

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    console.log(`deleteUser: ${user.email} deleted`);

    return sendSuccess(res, null, "User deleted successfully");
  } catch (error) {
    console.error(`deleteUser error: ${error.message}`);
    return sendError(res, "Failed to delete user");
  }
};
