import mongoose from "mongoose";

const actionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  actor: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  action: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ["completed", "in_progress", "planned", "cancelled"],
    default: "planned",
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  attachments: [
    {
      url: String,
      name: String,
      type: String,
    },
  ],
});

const responseActionSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ImpactReport",
      required: true,
    },
    actions: [actionSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    deadline: Date,
    budget: {
      allocated: Number,
      spent: Number,
      currency: {
        type: String,
        default: "THB",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
responseActionSchema.index({ reportId: 1 });
responseActionSchema.index({ "actions.status": 1 });
responseActionSchema.index({ priority: 1, lastUpdated: -1 });

// Virtual for completion percentage
responseActionSchema.virtual("completionPercentage").get(function () {
  if (this.actions.length === 0) return 0;
  const completedActions = this.actions.filter(
    (action) => action.status === "completed"
  ).length;
  return Math.round((completedActions / this.actions.length) * 100);
});

// Virtual for latest action
responseActionSchema.virtual("latestAction").get(function () {
  if (this.actions.length === 0) return null;
  return this.actions.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
});

// Pre-save middleware to update lastUpdated
responseActionSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to find by report ID
responseActionSchema.statics.findByReportId = function (reportId) {
  return this.findOne({ reportId }).populate("reportId");
};

// Instance method to add action
responseActionSchema.methods.addAction = function (actionData) {
  this.actions.push(actionData);
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to update action status
responseActionSchema.methods.updateActionStatus = function (
  actionId,
  status,
  notes = ""
) {
  const action = this.actions.id(actionId);
  if (action) {
    action.status = status;
    if (notes) action.notes = notes;
    this.lastUpdated = new Date();
    return this.save();
  }
  throw new Error("Action not found");
};

const ResponseAction = mongoose.model("ResponseAction", responseActionSchema);

export default ResponseAction;
