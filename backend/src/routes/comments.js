import express from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import {
  getCommentsByCase,
  createComment,
  likeComment,
  deleteComment,
  getCommentStats,
} from "../controllers/commentsController.js";

const router = express.Router();

// Rate limiting for comment creation (more restrictive)
const createCommentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 comment creations per windowMs
  message: {
    success: false,
    message: "คุณส่งความคิดเห็นบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for likes (less restrictive)
const likeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 likes per minute
  message: {
    success: false,
    message: "คุณกดถูกใจบ่อยเกินไป กรุณารอสักครู่",
  },
});

// Validation rules for creating comments
const validateComment = [
  body("text")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("ความคิดเห็นต้องมีความยาว 1-1000 ตัวอักษร")
    .escape(), // Sanitize HTML
  body("author")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("ชื่อผู้แสดงความคิดเห็นต้องไม่เกิน 100 ตัวอักษร")
    .escape(),
  body("avatar").optional().isURL().withMessage("URL รูปภาพไม่ถูกต้อง"),
];

// Routes

// GET /api/comments/:caseId - Get all comments for a case
router.get("/:caseId", getCommentsByCase);

// GET /api/comments/:caseId/stats - Get comment statistics for a case
router.get("/:caseId/stats", getCommentStats);

// POST /api/comments/:caseId - Create a new comment
router.post("/:caseId", createCommentLimiter, validateComment, createComment);

// PUT /api/comments/:commentId/like - Like/unlike a comment
router.put("/:commentId/like", likeLimiter, likeComment);

// DELETE /api/comments/:commentId - Delete a comment (admin only - for future)
router.delete("/:commentId", deleteComment);

export default router;
