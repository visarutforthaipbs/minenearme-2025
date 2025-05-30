import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: [
      {
        type: String, // IP addresses or user IDs
      },
    ],
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve for now, can be changed for moderation
    },
    replies: [
      {
        author: {
          type: String,
          required: true,
          trim: true,
          maxlength: 100,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient querying
commentSchema.index({ caseId: 1, createdAt: -1 });

// Virtual for comment age
commentSchema.virtual("age").get(function () {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - this.createdAt.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return "เมื่อสักครู่";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} นาทีที่แล้ว`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ชั่วโมงที่แล้ว`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} วันที่แล้ว`;
  }
});

// Ensure virtual fields are serialized
commentSchema.set("toJSON", { virtuals: true });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
