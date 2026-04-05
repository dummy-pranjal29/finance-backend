const mongoose = require("mongoose");
const Finance = require("../finance/finance.model");
const { sendSuccess } = require("../../utils/response");
const AppError = require("../../utils/AppError");
const asyncHandler = require("../../utils/asyncHandler");

const buildFilter = (query, requestingUser) => {
  const { startDate, endDate, userId } = query;
  const filter = {};

  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid userId format", 400);
    }
    if (requestingUser.role === "viewer" && userId !== requestingUser.id) {
      throw new AppError("Viewers can only access their own data", 403);
    }
    filter.createdBy = new mongoose.Types.ObjectId(userId);
  } else if (requestingUser.role === "viewer") {
    filter.createdBy = new mongoose.Types.ObjectId(requestingUser.id);
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  return filter;
};

exports.getSummary = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query, req.user);

  const result = await Finance.aggregate([
    { $match: { ...filter, isDeleted: false } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = { totalIncome: 0, totalExpenses: 0, netBalance: 0, incomeCount: 0, expenseCount: 0 };

  result.forEach((item) => {
    if (item._id === "income") {
      summary.totalIncome = item.total;
      summary.incomeCount = item.count;
    }
    if (item._id === "expense") {
      summary.totalExpenses = item.total;
      summary.expenseCount = item.count;
    }
  });

  summary.netBalance = summary.totalIncome - summary.totalExpenses;

  console.log(`getSummary: income=${summary.totalIncome} expenses=${summary.totalExpenses} net=${summary.netBalance}`);

  return sendSuccess(res, summary, "Summary fetched successfully");
});

exports.getCategoryTotals = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const filter = buildFilter(req.query, req.user);

  if (type) filter.type = type;
  filter.isDeleted = false;

  const result = await Finance.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const formatted = result.map((item) => ({
    category: item._id.category,
    type: item._id.type,
    total: item.total,
    count: item.count,
  }));

  console.log(`getCategoryTotals: returned ${formatted.length} category groups`);

  return sendSuccess(res, formatted, "Category totals fetched successfully");
});

exports.getTrends = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query, req.user);
  filter.isDeleted = false;

  const result = await Finance.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const trendsMap = {};

  result.forEach((item) => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
    if (!trendsMap[key]) {
      trendsMap[key] = { month: key, income: 0, expenses: 0, net: 0 };
    }
    if (item._id.type === "income") trendsMap[key].income = item.total;
    if (item._id.type === "expense") trendsMap[key].expenses = item.total;
  });

  const trends = Object.values(trendsMap).map((entry) => ({
    ...entry,
    net: entry.income - entry.expenses,
  }));

  console.log(`getTrends: returned ${trends.length} monthly trend entries`);

  return sendSuccess(res, trends, "Trends fetched successfully");
});

exports.getRecentActivity = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  const filter = buildFilter(req.query, req.user);
  filter.isDeleted = false;

  const records = await Finance.find(filter)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  console.log(`getRecentActivity: returned ${records.length} recent records`);

  return sendSuccess(res, records, "Recent activity fetched successfully");
});
