const AuditLog = require("./audit.model");
const { sendSuccess } = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");

exports.getAuditLogs = asyncHandler(async (req, res) => {
  const { entity, entityId, action, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (entity) filter.entity = entity;
  if (entityId) filter.entityId = entityId;
  if (action) filter.action = action;

  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    AuditLog.countDocuments(filter),
  ]);

  console.log(`getAuditLogs: returned ${logs.length} of ${total} logs`);

  return sendSuccess(res, {
    logs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  }, "Audit logs fetched successfully");
});
