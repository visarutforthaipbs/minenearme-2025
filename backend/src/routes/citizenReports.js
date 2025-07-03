import express from "express";
import { query, validationResult } from "express-validator";
import {
  fetchCSiteReports,
  fetchAllCSiteReports,
  extractMineCoordinates,
} from "../services/csiteService.js";

const router = express.Router();

// Validation rules for query parameters
const validateFilters = [
  query("datefrom")
    .optional()
    .isISO8601()
    .withMessage("datefrom must be in YYYY-MM-DD format"),
  query("dateto")
    .optional()
    .isISO8601()
    .withMessage("dateto must be in YYYY-MM-DD format"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("limit must be between 1 and 200"),
];

// Test endpoint to check C-Site API connection
router.get("/test", async (req, res) => {
  try {
    console.log("🧪 Testing C-Site API connection with keyword filtering...");

    // Test with a known location (Bangkok) and filters
    const testOptions = {
      limit: 5, // Small limit for testing
    };
    const testReports = await fetchCSiteReports(13.7563, 100.5018, testOptions);

    console.log(
      "✅ C-Site API test successful, received:",
      testReports.length,
      "mining-related reports"
    );

    res.json({
      success: true,
      message: "C-Site API connection test successful with keyword filtering",
      keyword: "เหมือง",
      reportsCount: testReports.length,
      sampleReports: testReports.slice(0, 2), // Return first 2 for debugging
    });
  } catch (error) {
    console.error("❌ C-Site API test failed:", error);
    res.status(500).json({
      success: false,
      message: "C-Site API test failed",
      error: error.message,
    });
  }
});

// GET /api/citizen-reports - Get all mining-related citizen reports with filtering
router.get("/", validateFilters, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: errors.array(),
      });
    }

    const options = {};
    if (req.query.datefrom) options.datefrom = req.query.datefrom;
    if (req.query.dateto) options.dateto = req.query.dateto;
    if (req.query.limit) options.limit = parseInt(req.query.limit);

    console.log(
      "🔍 Fetching all mining-related reports with options:",
      options
    );

    const reports = await fetchAllCSiteReports(options);

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      keyword: "เหมือง",
      filters: options,
    });
  } catch (error) {
    console.error("Error fetching citizen reports:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching mining-related citizen reports",
    });
  }
});

// POST /api/citizen-reports/nearby - Get mining-related reports near a specific location
router.post("/nearby", validateFilters, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: errors.array(),
      });
    }

    const { lat, lng, mineFeature } = req.body;

    let mineLocation = null;

    // Handle both direct coordinates and mine feature
    if (lat && lng) {
      mineLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    } else if (mineFeature) {
      mineLocation = extractMineCoordinates(mineFeature);
    }

    if (!mineLocation || isNaN(mineLocation.lat) || isNaN(mineLocation.lng)) {
      return res.status(400).json({
        success: false,
        message: "Valid coordinates (lat, lng) or mine feature is required",
      });
    }

    // Extract filtering options from query parameters
    const options = {};
    if (req.query.datefrom) options.datefrom = req.query.datefrom;
    if (req.query.dateto) options.dateto = req.query.dateto;
    if (req.query.limit) options.limit = parseInt(req.query.limit);

    console.log(
      "🔍 Fetching mining-related reports near:",
      mineLocation,
      "with options:",
      options
    );

    // Get nearby reports with filtering
    const nearbyReports = await fetchCSiteReports(
      mineLocation.lat,
      mineLocation.lng,
      options
    );

    console.log("Found", nearbyReports.length, "nearby mining-related reports");

    res.json({
      success: true,
      data: nearbyReports,
      count: nearbyReports.length,
      mineLocation,
      keyword: "เหมือง",
      filters: options,
    });
  } catch (error) {
    console.error("Error fetching nearby citizen reports:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching nearby mining-related citizen reports",
      error: error.message,
    });
  }
});

export default router;
