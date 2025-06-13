import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import reportsRouter from "./routes/reports.js";
import commentsRouter from "./routes/comments.js";
import citizenReportsRouter from "./routes/citizenReports.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// CORS configuration - MUST be before rate limiting
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://minenearme-2025.vercel.app",
        "https://minenearme2025.vercel.app",
        process.env.CORS_ORIGIN || "http://localhost:5173",
      ].filter(Boolean);

      console.log(`🌐 CORS request from origin: ${origin}`);

      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS origin allowed: ${origin}`);
        return callback(null, true);
      } else {
        console.log(`❌ CORS origin denied: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
      "Pragma",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200, // For legacy browser support
  })
);

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Disable this for development
  })
);

// Rate limiting (after CORS)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5000, // Increased significantly for development
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  skip: (req) => {
    // Skip rate limiting for OPTIONS requests (CORS preflight)
    return req.method === "OPTIONS";
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api/", limiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "MineNearMe API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/reports", reportsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/citizen-reports", citizenReportsRouter);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Comments API: http://localhost:${PORT}/api/comments`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});
