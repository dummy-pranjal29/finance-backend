const bcrypt = require("bcryptjs");
const User = require("../user/user.model");
const { sendSuccess } = require("../../utils/response");
const AppError = require("../../utils/AppError");
const asyncHandler = require("../../utils/asyncHandler");

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) throw new AppError("User not found", 404);

  console.log(`getProfile: ${user.email} fetched their profile`);

  return sendSuccess(res, user, "Profile fetched successfully");
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (email) {
    const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existing) throw new AppError("This email is already in use", 409);
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) throw new AppError("User not found", 404);

  console.log(`updateProfile: ${user.email} updated their profile`);

  return sendSuccess(res, user, "Profile updated successfully");
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User not found", 404);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new AppError("Current password is incorrect", 401);

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  console.log(`changePassword: ${user.email} changed their password`);

  return sendSuccess(res, null, "Password changed successfully");
});
