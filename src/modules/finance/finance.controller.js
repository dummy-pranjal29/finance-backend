const Finance = require("./finance.model");
const { sendSuccess, sendError } = require("../../utils/response");

exports.createRecord = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    if (!amount || !type || !category || !date) {
      return sendError(res, "amount, type, category, and date are required", 400);
    }

    if (amount <= 0) {
      return sendError(res, "amount must be greater than 0", 400);
    }

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
  } catch (error) {
    console.error(`createRecord error: ${error.message}`);
    return sendError(res, "Failed to create financial record");
  }
};

exports.getAllRecords = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(`getAllRecords error: ${error.message}`);
    return sendError(res, "Failed to fetch records");
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const record = await Finance.findById(req.params.id).populate("createdBy", "name email");

    if (!record) {
      return sendError(res, "Record not found", 404);
    }

    console.log(`getRecordById: fetched record ${record._id}`);

    return sendSuccess(res, record, "Record fetched successfully");
  } catch (error) {
    console.error(`getRecordById error: ${error.message}`);
    return sendError(res, "Failed to fetch record");
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    if (amount !== undefined && amount <= 0) {
      return sendError(res, "amount must be greater than 0", 400);
    }

    const record = await Finance.findByIdAndUpdate(
      req.params.id,
      { amount, type, category, date, notes },
      { new: true, runValidators: true }
    );

    if (!record) {
      return sendError(res, "Record not found", 404);
    }

    console.log(`updateRecord: record ${record._id} updated by user ${req.user.id}`);

    return sendSuccess(res, record, "Record updated successfully");
  } catch (error) {
    console.error(`updateRecord error: ${error.message}`);
    return sendError(res, "Failed to update record");
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const record = await Finance.findByIdAndDelete(req.params.id);

    if (!record) {
      return sendError(res, "Record not found", 404);
    }

    console.log(`deleteRecord: record ${record._id} deleted by user ${req.user.id}`);

    return sendSuccess(res, null, "Record deleted successfully");
  } catch (error) {
    console.error(`deleteRecord error: ${error.message}`);
    return sendError(res, "Failed to delete record");
  }
};
