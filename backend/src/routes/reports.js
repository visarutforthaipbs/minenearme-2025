import express from "express";
import { body, validationResult, query } from "express-validator";
import ImpactReport from "../models/ImpactReport.js";
import ResponseAction from "../models/ResponseAction.js";
import { upload, deleteFromCloudinary } from "../config/cloudinary.js";

const router = express.Router();

// Validation middleware
const validateReport = [
  body("position").isJSON().withMessage("Position must be valid JSON"),
  body("impactTypes")
    .isArray({ min: 1 })
    .withMessage("At least one impact type is required"),
  body("details")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Details must be between 10 and 2000 characters"),
  body("contact")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Contact must be less than 255 characters"),
];

// GET /api/reports - Get all reports with filtering and pagination
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["pending", "verified", "rejected"])
      .withMessage("Invalid status"),
    query("impactType")
      .optional()
      .isIn(["environment", "health", "economic", "other"])
      .withMessage("Invalid impact type"),
    query("responseStatus")
      .optional()
      .isIn(["investigating", "addressed", "no_action"])
      .withMessage("Invalid response status"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.impactType)
        filter.impactTypes = { $in: [req.query.impactType] };
      if (req.query.responseStatus)
        filter.responseStatus = req.query.responseStatus;

      // Get reports with pagination
      const reports = await ImpactReport.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-adminNotes"); // Exclude admin notes from public API

      // Get total count for pagination
      const total = await ImpactReport.countDocuments(filter);

      res.json({
        success: true,
        data: {
          reports,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน",
      });
    }
  }
);

// GET /api/reports/:id - Get specific report with response actions
router.get("/:id", async (req, res) => {
  try {
    const report = await ImpactReport.findById(req.params.id)
      .populate("nearbyMines")
      .select("-adminNotes");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายงาน",
      });
    }

    // Increment view count
    await report.incrementViews();

    // Get response actions
    const responseActions = await ResponseAction.findByReportId(report._id);

    res.json({
      success: true,
      data: {
        report,
        responseActions,
      },
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน",
    });
  }
});

// POST /api/reports - Create new report with file uploads
router.post(
  "/",
  upload.array("files", 10),
  validateReport,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Clean up uploaded files if validation fails
        if (req.files && req.files.length > 0) {
          for (const file of req.files) {
            await deleteFromCloudinary(file.filename);
          }
        }

        return res.status(400).json({
          success: false,
          message: "ข้อมูลไม่ถูกต้อง",
          errors: errors.array(),
        });
      }

      const { position, impactTypes, details, contact } = req.body;
      const parsedPosition = JSON.parse(position);

      // Process uploaded files
      const evidence = req.files
        ? req.files.map((file) => ({
            url: file.path,
            publicId: file.filename,
            type: file.resource_type === "video" ? "video" : "image",
            originalName: file.originalname,
            size: file.bytes,
            mimeType: file.mimetype,
          }))
        : [];

      // Create new report
      const report = new ImpactReport({
        location: {
          lat: parseFloat(parsedPosition.lat),
          lng: parseFloat(parsedPosition.lng),
        },
        impactTypes: Array.isArray(impactTypes)
          ? impactTypes
          : JSON.parse(impactTypes),
        description: details,
        reporter: {
          contact: contact || "",
          verified: false,
        },
        evidence,
      });

      await report.save();

      // Create initial response action entry
      const responseAction = new ResponseAction({
        reportId: report._id,
        actions: [
          {
            date: new Date(),
            actor: "ระบบ",
            action: "รับรายงานและเริ่มตรวจสอบข้อมูล",
            status: "completed",
          },
        ],
      });

      await responseAction.save();

      res.status(201).json({
        success: true,
        message: "รายงานถูกส่งเรียบร้อยแล้ว",
        data: {
          report: {
            id: report._id,
            title: report.title,
            location: report.location,
            status: report.status,
            createdAt: report.createdAt,
          },
        },
      });
    } catch (error) {
      console.error("Error creating report:", error);

      // Clean up uploaded files on error
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await deleteFromCloudinary(file.filename).catch(console.error);
        }
      }

      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการส่งรายงาน",
      });
    }
  }
);

// GET /api/reports/nearby/:lat/:lng - Get reports near coordinates
router.get(
  "/nearby/:lat/:lng",
  [
    query("radius")
      .optional()
      .isFloat({ min: 1, max: 100 })
      .withMessage("Radius must be between 1 and 100 km"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { lat, lng } = req.params;
      const radius = parseFloat(req.query.radius) || 10; // Default 10km

      const reports = await ImpactReport.findByRadius(
        parseFloat(lat),
        parseFloat(lng),
        radius
      ).select("-adminNotes");

      res.json({
        success: true,
        data: {
          reports,
          searchCenter: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radius,
        },
      });
    } catch (error) {
      console.error("Error finding nearby reports:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการค้นหารายงานใกล้เคียง",
      });
    }
  }
);

// GET /api/reports/:id/actions - Get response actions for a report
router.get("/:id/actions", async (req, res) => {
  try {
    const responseActions = await ResponseAction.findByReportId(req.params.id);

    if (!responseActions) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบการดำเนินการตอบสนอง",
      });
    }

    res.json({
      success: true,
      data: responseActions,
    });
  } catch (error) {
    console.error("Error fetching response actions:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการดำเนินการ",
    });
  }
});

// POST /api/reports/case/:caseId - Create case-specific additional information report
router.post(
  "/case/:caseId",
  [
    body("details")
      .isLength({ min: 10, max: 2000 })
      .withMessage("Details must be between 10 and 2000 characters"),
    body("name")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Name must be less than 100 characters"),
    body("contact")
      .optional()
      .isLength({ max: 255 })
      .withMessage("Contact must be less than 255 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "ข้อมูลไม่ถูกต้อง",
          errors: errors.array(),
        });
      }

      const { caseId } = req.params;
      const { details, name, contact } = req.body;

      // Create new case-specific report
      const report = new ImpactReport({
        caseId: caseId,
        title: `ข้อมูลเพิ่มเติมสำหรับ ${caseId}`,
        description: details,
        reporter: {
          name: name || "ไม่ระบุชื่อ",
          contact: contact || "",
          verified: false,
        },
        impactTypes: ["additional_info"], // Special type for case reports
        location: {
          lat: 0,
          lng: 0,
        },
        status: "pending",
        responseStatus: "investigating",
      });

      await report.save();

      // Create initial response action entry
      const responseAction = new ResponseAction({
        reportId: report._id,
        actions: [
          {
            date: new Date(),
            actor: "ระบบ",
            action: `รับข้อมูลเพิ่มเติมสำหรับกรณีศึกษา ${caseId}`,
            status: "completed",
          },
        ],
      });

      await responseAction.save();

      res.status(201).json({
        success: true,
        message:
          "ส่งข้อมูลเพิ่มเติมเรียบร้อยแล้ว ทีมงานจะติดต่อกลับภายใน 2-3 วันทำการ",
        data: {
          report: {
            id: report._id,
            caseId: report.caseId,
            title: report.title,
            status: report.status,
            createdAt: report.createdAt,
          },
        },
      });
    } catch (error) {
      console.error("Error creating case report:", error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง",
      });
    }
  }
);

// GET /api/reports/case/:caseId - Get all reports for a specific case
router.get("/case/:caseId", async (req, res) => {
  try {
    const { caseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reports = await ImpactReport.find({ caseId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-adminNotes");

    const total = await ImpactReport.countDocuments({ caseId });

    res.json({
      success: true,
      data: {
        reports,
        caseId,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching case reports:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน",
    });
  }
});

export default router;
