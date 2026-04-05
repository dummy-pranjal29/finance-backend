const mongoose = require("mongoose");
const Budget = require("./budget.model");
const Finance = require("../finance/finance.model");
const { sendSuccess } = require("../../utils/response");
const AppError = require("../../utils/AppError");
const asyncHandler = require("../../utils/asyncHandler");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const computeUtilization = async (budget) => {
  const [year, month] = budget.month.split("-").map(Number);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const result = await Finance.aggregate([
    {
      $match: {
        category: { $regex: new RegExp(`^${budget.category}$`, "i") },
        type: "expense",
        date: { $gte: startDate, $lte: endDate },
        createdBy: budget.createdBy,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        spent: { $sum: "$amount" },
      },
    },
  ]);

  const spent = result.length > 0 ? result[0].spent : 0;
  const remaining = Math.max(budget.limit - spent, 0);
  const percentUsed = Number(((spent / budget.limit) * 100).toFixed(2));

  return { spent, remaining, percentUsed };
};

exports.createBudget = asyncHandler(async (req, res) => {
  const { category, month, limit } = req.body;

  const existing = await Budget.findOne({ category, month, createdBy: req.user.id });
  if (existing) throw new AppError(`A budget for "${category}" in ${month} already exists`, 409);

  const budget = await Budget.create({ category, month, limit, createdBy: req.user.id });

  console.log(`createBudget: ${category} | ${month} | limit=${limit} by user ${req.user.id}`);

  return sendSuccess(res, budget, "Budget created successfully", 201);
});

exports.getAllBudgets = asyncHandler(async (req, res) => {
  const { month } = req.query;
  const filter = { createdBy: req.user.id };

  if (month) filter.month = month;

  const budgets = await Budget.find(filter).sort({ month: -1 });

  const budgetsWithUtilization = await Promise.all(
    budgets.map(async (budget) => {
      const utilization = await computeUtilization(budget);
      return { ...budget.toObject(), ...utilization };
    })
  );

  console.log(`getAllBudgets: returned ${budgets.length} budgets for user ${req.user.id}`);

  return sendSuccess(res, budgetsWithUtilization, "Budgets fetched successfully");
});

exports.getBudgetById = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) throw new AppError("Invalid budget ID format", 400);

  const budget = await Budget.findOne({ _id: req.params.id, createdBy: req.user.id });
  if (!budget) throw new AppError("Budget not found", 404);

  const utilization = await computeUtilization(budget);

  console.log(`getBudgetById: fetched budget ${budget._id}`);

  return sendSuccess(res, { ...budget.toObject(), ...utilization }, "Budget fetched successfully");
});

exports.updateBudget = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) throw new AppError("Invalid budget ID format", 400);

  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.id },
    { limit: req.body.limit },
    { new: true, runValidators: true }
  );

  if (!budget) throw new AppError("Budget not found", 404);

  const utilization = await computeUtilization(budget);

  console.log(`updateBudget: budget ${budget._id} limit updated to ${budget.limit}`);

  return sendSuccess(res, { ...budget.toObject(), ...utilization }, "Budget updated successfully");
});

exports.deleteBudget = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) throw new AppError("Invalid budget ID format", 400);

  const budget = await Budget.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
  if (!budget) throw new AppError("Budget not found", 404);

  console.log(`deleteBudget: budget ${budget._id} deleted by user ${req.user.id}`);

  return sendSuccess(res, null, "Budget deleted successfully");
});
