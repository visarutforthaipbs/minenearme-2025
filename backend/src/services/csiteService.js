import fetch from "node-fetch";

const CSITE_CONFIG = {
  baseUrl: "https://api.redesign.csitereport.com",
  token: "d73343fba45875c2eec41e7bbf0559d3",
  maxDistance: 30, // 30km buffer
  keyword: "เหมือง", // Mining keyword in Thai
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Extract coordinates from C-Site API item
 */
function extractCoordinates(item) {
  console.log(
    "Processing item:",
    item.post_id,
    item.post_header?.substring(0, 50)
  );

  // Check if coordinates exist as direct properties
  if (item.post_latitude && item.post_longitude) {
    const lat = parseFloat(item.post_latitude);
    const lng = parseFloat(item.post_longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(
        "Found coordinates from post_latitude/post_longitude:",
        lat,
        lng
      );
      return { lat, lng };
    }
  }

  console.log("No valid coordinates found for item:", item.post_id);
  return null;
}

/**
 * Create form data for C-Site API request
 */
function createFormData(options = {}) {
  const formData = new URLSearchParams();
  formData.append("token", CSITE_CONFIG.token);
  formData.append("keyword", CSITE_CONFIG.keyword);

  // Add optional parameters
  if (options.datefrom) {
    formData.append("datefrom", options.datefrom);
  }
  if (options.dateto) {
    formData.append("dateto", options.dateto);
  }
  if (options.limit) {
    formData.append("limit", options.limit.toString());
  } else {
    formData.append("limit", "100"); // Default limit
  }

  return formData;
}

/**
 * Fetch nearby C-Site reports for a mine location with keyword filtering
 */
export async function fetchCSiteReports(mineLat, mineLng, options = {}) {
  try {
    console.log("🔍 Fetching C-Site reports with keyword filtering...");
    console.log("📍 Mine location:", { lat: mineLat, lng: mineLng });
    console.log("🏷️ Using keyword:", CSITE_CONFIG.keyword);

    const formData = createFormData(options);
    console.log("📝 Form data:", formData.toString());

    const response = await fetch(
      "https://api.redesign.csitereport.com/externaltopic/get_topic_list",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`C-Site API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      "📦 Raw C-Site API response:",
      JSON.stringify(data).substring(0, 500) + "..."
    );
    console.log("📊 Response type:", typeof data);
    console.log("📊 Response keys:", Object.keys(data || {}));

    // Check if data is an array or has a topics property
    let reports = [];
    if (Array.isArray(data)) {
      reports = data;
    } else if (data.topics && Array.isArray(data.topics)) {
      reports = data.topics;
    } else if (data.data && Array.isArray(data.data)) {
      reports = data.data;
    } else {
      console.log("❌ Unexpected response structure:", data);
      return [];
    }

    console.log("📋 Processing reports, total items:", reports.length);
    console.log(`🏷️ Reports filtered by keyword "${CSITE_CONFIG.keyword}"`);

    if (!Array.isArray(reports) || reports.length === 0) {
      console.log("⚠️ No reports received from C-Site API");
      return [];
    }

    // Log first item structure
    if (reports.length > 0) {
      console.log(
        "🔍 First report structure:",
        JSON.stringify(reports[0]).substring(0, 300) + "..."
      );
    }

    const nearbyReports = [];

    for (const item of reports) {
      const coordinates = extractCoordinates(item);
      if (!coordinates) {
        console.log(
          "⚠️ No coordinates found for item:",
          item.post_id || "unknown"
        );
        continue;
      }

      const distance = calculateDistance(
        mineLat,
        mineLng,
        coordinates.lat,
        coordinates.lng
      );

      console.log(
        `📍 Item ${item.post_id}: distance = ${distance.toFixed(2)}km`
      );

      if (distance <= CSITE_CONFIG.maxDistance) {
        console.log(
          `✅ Adding mining-related report within ${
            CSITE_CONFIG.maxDistance
          }km: ${item.post_header?.substring(0, 50)}`
        );
        nearbyReports.push({
          id: item.post_id,
          title: item.post_header,
          content: item.post_detail,
          date: item.post_create_date,
          author: item.member_displayname,
          location: {
            lat: coordinates.lat,
            lng: coordinates.lng,
          },
          distance: parseFloat(distance.toFixed(2)),
          images: item.img || [],
          videos: item.vdo || [],
          tags: item.tag || [],
          externalUrl: `https://www.csitereport.com/topic/${item.post_id}`,
        });
      }
    }

    console.log(
      `🎯 Filtered ${nearbyReports.length} mining-related reports within ${CSITE_CONFIG.maxDistance}km of mine location`
    );

    return nearbyReports;
  } catch (error) {
    console.error("❌ Error fetching C-Site reports:", error);
    throw error;
  }
}

/**
 * Fetch all mining-related reports (not location-filtered)
 */
export async function fetchAllCSiteReports(options = {}) {
  try {
    console.log("🔍 Fetching all mining-related C-Site reports...");
    console.log("🏷️ Using keyword:", CSITE_CONFIG.keyword);

    const formData = createFormData(options);
    console.log("📝 Form data:", formData.toString());

    const response = await fetch(
      "https://api.redesign.csitereport.com/externaltopic/get_topic_list",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`C-Site API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📦 Fetched mining reports, total:", data?.length || 0);

    // Parse response structure
    let reports = [];
    if (Array.isArray(data)) {
      reports = data;
    } else if (data.topics && Array.isArray(data.topics)) {
      reports = data.topics;
    } else if (data.data && Array.isArray(data.data)) {
      reports = data.data;
    }

    // Transform reports
    const transformedReports = reports.map((item) => ({
      id: item.post_id,
      title: item.post_header,
      content: item.post_detail,
      date: item.post_create_date,
      author: item.member_displayname,
      location: {
        lat: parseFloat(item.post_latitude) || 0,
        lng: parseFloat(item.post_longitude) || 0,
      },
      images: item.img || [],
      videos: item.vdo || [],
      tags: item.tag || [],
      externalUrl: `https://www.csitereport.com/topic/${item.post_id}`,
    }));

    console.log(
      `🎯 Returned ${transformedReports.length} mining-related reports`
    );
    return transformedReports;
  } catch (error) {
    console.error("❌ Error fetching all C-Site reports:", error);
    throw error;
  }
}

/**
 * Extract coordinates from GeoJSON feature (for mine locations)
 */
export function extractMineCoordinates(geoJsonFeature) {
  if (!geoJsonFeature || !geoJsonFeature.geometry) {
    return null;
  }

  const { geometry } = geoJsonFeature;
  let coords = null;

  switch (geometry.type) {
    case "Point":
      coords = geometry.coordinates;
      break;
    case "Polygon":
      // Use first coordinate of polygon
      coords = geometry.coordinates[0][0];
      break;
    case "MultiPolygon":
      // Use first coordinate of first polygon
      coords = geometry.coordinates[0][0][0];
      break;
    default:
      return null;
  }

  if (!coords || coords.length < 2) {
    return null;
  }

  return {
    lat: coords[1], // GeoJSON is [longitude, latitude]
    lng: coords[0],
  };
}

/**
 * Get nearby reports for a specific mine location with filtering options
 */
export async function getNearbyReports(mineLocation, filters = {}) {
  try {
    const { lat, lng } = mineLocation;
    return await fetchCSiteReports(lat, lng, filters);
  } catch (error) {
    console.error("Error getting nearby reports:", error);
    throw error;
  }
}
