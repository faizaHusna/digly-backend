const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  userId: Number,
  action: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model(
  "ActivityLog",
  ActivityLogSchema
);