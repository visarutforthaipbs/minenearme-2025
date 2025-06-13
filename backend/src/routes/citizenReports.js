import express from "express";
import { query, validationResult } from "express-validator";
import {
  fetchCSiteReports,
  extractMineCoordinates,
} from "../services/csiteService.js";

const router = express.Router();

// Test endpoint to check C-Site API connection
router.get("/test", async (req, res) => {
  try {
    console.log("🧪 Testing C-Site API connection...");

    // Test with a known location (Bangkok)
    const testReports = await fetchCSiteReports(13.7563, 100.5018);

    console.log(
      "✅ C-Site API test successful, received:",
      testReports.length,
      "reports"
    );

    res.json({
      success: true,
      message: "C-Site API connection test successful",
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

// GET /api/citizen-reports - Get all citizen reports (for testing)
router.get("/", async (req, res) => {
  try {
    // Use central Thailand coordinates for general search
    const reports = await fetchCSiteReports(13.7563, 100.5018);

    res.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    console.error("Error fetching citizen reports:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching citizen reports",
    });
  }
});

// POST /api/citizen-reports/nearby - Get reports near a specific location
router.post("/nearby", async (req, res) => {
  try {
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

    console.log("Fetching reports near:", mineLocation);

    // Get nearby reports
    const nearbyReports = await fetchCSiteReports(
      mineLocation.lat,
      mineLocation.lng
    );

    console.log("Found", nearbyReports.length, "nearby reports");

    res.json({
      success: true,
      data: nearbyReports,
      count: nearbyReports.length,
      mineLocation,
    });
  } catch (error) {
    console.error("Error fetching nearby citizen reports:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching nearby citizen reports",
      error: error.message,
    });
  }
});

export default router;
