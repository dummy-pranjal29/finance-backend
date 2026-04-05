const mongoose = require("mongoose");
const Finance = require("./finance.model");
const { sendSuccess } = require("../../utils/response");
const AppError = require("../../utils/AppError");
const asyncHandler = require("../../utils/asyncHandler");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createRecord = asyncHandler(async (req, res) => {
  const { amount, type, category, date, notes } = req.body;

  const record = await Finance.create({
    amount,
    type,
    category,
    date,
    notes,
    createdBy: req.user.id,
  });

  console.log(`createRecord: ${type} of ${amount} in category "${category}" by user ${req.user.id}`);

  return sendSuccess(res, record, "Financial record created successfully", 201);
});

exports.getAllRecords = asyncHandler(async (req, res) => {
  const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;

  const filter = {};

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [records, total] = await Promise.all([
    Finance.find(filter)
      .populate("createdBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Finance.countDocuments(filter),
  ]);

  console.log(`getAllRecords: returned ${records.length} of ${total} records`);

  return sendSuccess(res, {
    records,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  }, "Records fetched successfully");
});

exports.getRecordById = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) throw new AppError("Invalid record ID format", 400);

  const record = await Finance.findById(req.params.id).populate("createdBy", "name email");
  if (!record) throw new AppError("Record not found", 404);

  console.log(`getRecordById: fetched record ${record._id}`);

  return sendSuccess(res, record, "Record fetched successfully");
});

exports.updateRecord = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) throw new AppError("Invalid record ID format", 400);

  const { amount, type, category, date, notes } = req.body;

  const record = await Finance.findByIdAndUpdate(
    req.params.id,
    { amount, type, category, date, notes },
    { new: true, runValidators: true }
  );

  if (!record) throw new AppError("Record not found", 404);

  console.log(`updateRecord: record ${record._id} updated by user ${req.user.id}`);

  return sendSuccess(res, record, "Record updated successfully");
});

exports.deleteRecord = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) throw new AppError("Invalid record ID format", 400);

  const record = await Finance.findByIdAndDelete(req.params.id);
  if (!record) throw new AppError("Record not found", 404);

  console.log(`deleteRecord: record ${record._id} deleted by user ${req.user.id}`);

  return sendSuccess(res, null, "Record deleted successfully");
});
