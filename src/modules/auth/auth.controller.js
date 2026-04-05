const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../user/user.model");
const { sendSuccess, sendError } = require("../../utils/response");
const config = require("../../config/index");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "name, email, and password are required", 400);
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, "A user with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = generateToken(user);

    console.log(`Register: new user ${user.email} | role: ${user.role}`);

    return sendSuccess(res, { token }, "Registration successful", 201);
  } catch (error) {
    console.error(`register error: ${error.message}`);
    return sendError(res, "Registration failed");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "email and password are required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    if (!user.isActive) {
      return sendError(res, "Account is deactivated", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", 401);
    }

    const token = generateToken(user);

    console.log(`Login: ${user.email} authenticated | role: ${user.role}`);

    return sendSuccess(res, { token }, "Login successful");
  } catch (error) {
    console.error(`login error: ${error.message}`);
    return sendError(res, "Login failed");
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    console.log(`getMe: ${user.email} fetched their profile`);

    return sendSuccess(res, user, "Profile fetched successfully");
  } catch (error) {
    console.error(`getMe error: ${error.message}`);
    return sendError(res, "Failed to fetch profile");
  }
};
