import Comment from "../models/Comment.js";
import { validationResult } from "express-validator";

// Get all comments for a specific case
export const getCommentsByCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      caseId,
      isApproved: true,
    })
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .lean(); // For better performance

    const total = await Comment.countDocuments({
      caseId,
      isApproved: true,
    });

    // Add age calculation to each comment
    const commentsWithAge = comments.map((comment) => ({
      ...comment,
      age: calculateAge(comment.createdAt),
    }));

    res.status(200).json({
      success: true,
      data: {
        comments: commentsWithAge,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: comments.length,
          totalComments: total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงความคิดเห็น",
    });
  }
};

// Create a new comment
export const createComment = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "ข้อมูลไม่ถูกต้อง",
        errors: errors.array(),
      });
    }

    const { caseId } = req.params;
    const { author, text, avatar } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    // Create new comment
    const newComment = new Comment({
      caseId,
      author: author || "ผู้ใช้งาน",
      text,
      avatar,
    });

    const savedComment = await newComment.save();

    // Return the comment with age calculation
    const commentWithAge = {
      ...savedComment.toJSON(),
      age: calculateAge(savedComment.createdAt),
    };

    res.status(201).json({
      success: true,
      message: "เพิ่มความคิดเห็นเรียบร้อยแล้ว",
      data: commentWithAge,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มความคิดเห็น",
    });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const clientIP = req.ip || req.connection.remoteAddress;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบความคิดเห็นนี้",
      });
    }

    // Check if this IP has already liked this comment
    const hasLiked = comment.likedBy.includes(clientIP);

    if (hasLiked) {
      // Unlike: remove IP and decrease likes
      comment.likedBy = comment.likedBy.filter((ip) => ip !== clientIP);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like: add IP and increase likes
      comment.likedBy.push(clientIP);
      comment.likes += 1;
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: hasLiked ? "ยกเลิกการถูกใจแล้ว" : "ถูกใจแล้ว",
      data: {
        likes: comment.likes,
        hasLiked: !hasLiked,
      },
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการถูกใจความคิดเห็น",
    });
  }
};

// Delete a comment (admin only - for future use)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบความคิดเห็นนี้",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "ลบความคิดเห็นเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบความคิดเห็น",
    });
  }
};

// Helper function to calculate comment age
const calculateAge = (createdAt) => {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60)
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
};

// Get comment statistics for a case
export const getCommentStats = async (req, res) => {
  try {
    const { caseId } = req.params;

    const stats = await Comment.aggregate([
      { $match: { caseId, isApproved: true } },
      {
        $group: {
          _id: null,
          totalComments: { $sum: 1 },
          totalLikes: { $sum: "$likes" },
          avgLikes: { $avg: "$likes" },
        },
      },
    ]);

    const result = stats[0] || {
      totalComments: 0,
      totalLikes: 0,
      avgLikes: 0,
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching comment stats:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงสถิติความคิดเห็น",
    });
  }
};
