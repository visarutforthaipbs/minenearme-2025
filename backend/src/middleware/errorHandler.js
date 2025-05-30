// Global error handling middleware
export const errorHandler = (error, req, res, next) => {
  console.error("Error occurred:", error);

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: "ข้อมูลไม่ถูกต้อง",
      errors,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "รูปแบบ ID ไม่ถูกต้อง",
    });
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "ข้อมูลซ้ำ",
    });
  }

  // Multer file upload error
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 50MB)",
    });
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      message: "อัปโหลดไฟล์ได้สูงสุด 10 ไฟล์",
    });
  }

  // Cloudinary error
  if (error.name === "CloudinaryError") {
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์",
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token ไม่ถูกต้อง",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token หมดอายุ",
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};
