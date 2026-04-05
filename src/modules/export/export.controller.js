const Finance = require("../finance/finance.model");
const { sendError } = require("../../utils/response");
const AppError = require("../../utils/AppError");
const asyncHandler = require("../../utils/asyncHandler");

const buildExportFilter = (query) => {
  const { type, category, startDate, endDate } = query;
  const filter = {};

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  return filter;
};

const recordToRow = (record) => {
  const createdBy = record.createdBy ? record.createdBy.name : "Unknown";
  const date = record.date ? record.date.toISOString().split("T")[0] : "";
  const notes = record.notes ? `"${record.notes.replace(/"/g, '""')}"` : "";

  return `${record.amount},${record.type},${record.category},${date},${notes},${createdBy}`;
};

exports.exportCSV = asyncHandler(async (req, res) => {
  const filter = buildExportFilter(req.query);

  const records = await Finance.find(filter)
    .populate("createdBy", "name")
    .sort({ date: -1 });

  if (records.length === 0) throw new AppError("No records found to export", 404);

  const header = "amount,type,category,date,notes,createdBy";
  const rows = records.map(recordToRow);
  const csv = [header, ...rows].join("\n");

  const filename = `finance-export-${Date.now()}.csv`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  console.log(`exportCSV: exported ${records.length} records as ${filename}`);

  res.send(csv);
});

exports.exportJSON = asyncHandler(async (req, res) => {
  const filter = buildExportFilter(req.query);

  const records = await Finance.find(filter)
    .populate("createdBy", "name email")
    .sort({ date: -1 });

  if (records.length === 0) throw new AppError("No records found to export", 404);

  const filename = `finance-export-${Date.now()}.json`;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  console.log(`exportJSON: exported ${records.length} records as ${filename}`);

  res.send(JSON.stringify({ total: records.length, exportedAt: new Date(), records }, null, 2));
});
