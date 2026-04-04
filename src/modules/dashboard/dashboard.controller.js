const Finance = require("../finance/finance.model");
const { sendSuccess, sendError } = require("../../utils/response");

exports.getSummary = async (req, res) => {
  try {
    const result = await Finance.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const summary = { totalIncome: 0, totalExpenses: 0, netBalance: 0 };

    result.forEach((item) => {
      if (item._id === "income") summary.totalIncome = item.total;
      if (item._id === "expense") summary.totalExpenses = item.total;
    });

    summary.netBalance = summary.totalIncome - summary.totalExpenses;

    console.log(`getSummary: income=${summary.totalIncome} expenses=${summary.totalExpenses} net=${summary.netBalance}`);

    return sendSuccess(res, summary, "Summary fetched successfully");
  } catch (error) {
    console.error(`getSummary error: ${error.message}`);
    return sendError(res, "Failed to fetch summary");
  }
};

exports.getCategoryTotals = async (req, res) => {
  try {
    const { type } = req.query;
    const match = type ? { type } : {};

    const result = await Finance.aggregate([
      { $match: match },
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
  } catch (error) {
    console.error(`getCategoryTotals error: ${error.message}`);
    return sendError(res, "Failed to fetch category totals");
  }
};

exports.getTrends = async (req, res) => {
  try {
    const result = await Finance.aggregate([
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
  } catch (error) {
    console.error(`getTrends error: ${error.message}`);
    return sendError(res, "Failed to fetch trends");
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const records = await Finance.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`getRecentActivity: returned ${records.length} recent records`);

    return sendSuccess(res, records, "Recent activity fetched successfully");
  } catch (error) {
    console.error(`getRecentActivity error: ${error.message}`);
    return sendError(res, "Failed to fetch recent activity");
  }
};
