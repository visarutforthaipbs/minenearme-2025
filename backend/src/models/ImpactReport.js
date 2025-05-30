import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  originalName: String,
  size: Number, // File size in bytes
  mimeType: String,
});

const reporterSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  contact: {
    type: String,
    trim: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const locationSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
  },
  lng: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
  },
});

const impactReportSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      index: true,
      sparse: true, // Allow null values but create index for non-null values
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      default: function () {
        return this.caseId
          ? `ข้อมูลเพิ่มเติมสำหรับ ${this.caseId}`
          : "รายงานผลกระทบ";
      },
    },
    location: {
      type: locationSchema,
      required: true,
    },
    impactTypes: [
      {
        type: String,
        enum: ["environment", "health", "economic", "other", "additional_info"],
        required: true,
      },
    ],
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    reporter: reporterSchema,
    evidence: [evidenceSchema],
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    responseStatus: {
      type: String,
      enum: ["investigating", "addressed", "no_action"],
      default: "investigating",
    },
    nearbyMines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mine",
      },
    ],
    // Additional metadata
    views: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    tags: [String],
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
impactReportSchema.index({ location: "2dsphere" }); // Geospatial index
impactReportSchema.index({ status: 1, createdAt: -1 });
impactReportSchema.index({ impactTypes: 1 });
impactReportSchema.index({ responseStatus: 1 });

// Virtual for formatted date
impactReportSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toISOString().split("T")[0];
});

// Virtual for evidence count
impactReportSchema.virtual("evidenceCount").get(function () {
  return this.evidence.length;
});

// Pre-save middleware to generate title if not provided
impactReportSchema.pre("save", function (next) {
  if (!this.title || this.title.trim() === "") {
    this.title = `ผลกระทบใน ${this.location.lat.toFixed(
      4
    )}, ${this.location.lng.toFixed(4)}`;
  }
  next();
});

// Static method to find reports by location radius
impactReportSchema.statics.findByRadius = function (lat, lng, radiusKm = 10) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: radiusKm * 1000, // Convert km to meters
      },
    },
  });
};

// Instance method to increment views
impactReportSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

const ImpactReport = mongoose.model("ImpactReport", impactReportSchema);

export default ImpactReport;
