// Service for integrating with C-Site external topic API via our backend
// Backend now uses keyword filtering with "เหมือง" to fetch mining-related posts
import type { Feature } from "geojson";

export interface CSiteTopic {
  post_id: string;
  post_header: string;
  post_detail: string;
  post_latitude: string;
  post_longitude: string;
  post_create_date: string;
  member_displayname: string;
  member_img_profile: string;
  img: Array<{
    post_img_original_path: string;
    post_img_thumb_wm_path: string;
    post_img_hd_wm_path: string;
  }>;
  vdo: Array<{
    post_video_original_path: string;
    post_video_path: string;
  }>;
  tag: string[];
  reverse_geo: {
    post_province_id: string;
    post_amphur_id: string;
    post_district_id: string;
    post_province_name: string;
    post_amphur_name: string;
    post_district_name: string;
    post_zipcode: string;
    post_geography_id: string;
    post_raw_json: string;
  };
}

// Transformed interface for frontend components
export interface CitizenReport {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  location: {
    lat: number;
    lng: number;
  };
  distance: number;
  images: Array<{
    post_img_original_path: string;
    post_img_thumb_wm_path: string;
    post_img_hd_wm_path: string;
  }>;
  videos: Array<{
    post_video_original_path: string;
    post_video_path: string;
  }>;
  tags: string[];
  externalUrl: string;
}

export interface CSiteTopicFilter {
  datefrom?: string; // YYYY-MM-DD format
  dateto?: string; // YYYY-MM-DD format
  limit?: number; // Default 50
  keyword?: string; // Search keyword (backend automatically uses "เหมือง" for mining)
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://minenearme-backend.onrender.com/api";

const ENABLE_CITIZEN_REPORTS =
  import.meta.env.VITE_ENABLE_CITIZEN_REPORTS !== "false";

/**
 * Get nearby citizen reports for a specific mine
 * Backend automatically filters for mining-related posts using keyword "เหมือง"
 */
export async function getNearbyReports(
  mineFeature: Feature,
  filter: CSiteTopicFilter = {}
): Promise<CSiteTopic[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filter.datefrom) queryParams.append("datefrom", filter.datefrom);
    if (filter.dateto) queryParams.append("dateto", filter.dateto);
    if (filter.limit) queryParams.append("limit", filter.limit.toString());

    const url = `${API_BASE_URL}/citizen-reports/nearby?${queryParams}`;
    console.log("🌐 Making API call to:", url);
    console.log("📍 Mine feature:", mineFeature);
    console.log("🏷️ Backend filtering with keyword: เหมือง");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mineFeature,
      }),
    });

    console.log("📡 API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error response:", errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ API Response data:", result);
    console.log(
      `📊 Retrieved ${result.data?.length || 0} mining-related reports`
    );

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch reports");
    }

    return result.data || [];
  } catch (error) {
    console.error("Error getting nearby mining reports:", error);
    return [];
  }
}

/**
 * Fetch all citizen reports with optional filtering
 * Backend automatically filters for mining-related posts using keyword "เหมือง"
 */
export async function fetchAllReports(
  filter: CSiteTopicFilter = {}
): Promise<CSiteTopic[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filter.datefrom) queryParams.append("datefrom", filter.datefrom);
    if (filter.dateto) queryParams.append("dateto", filter.dateto);
    if (filter.limit) queryParams.append("limit", filter.limit.toString());

    const url = `${API_BASE_URL}/citizen-reports?${queryParams}`;
    console.log("🌐 Fetching all mining reports from:", url);
    console.log("🏷️ Backend filtering with keyword: เหมือง");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    console.log(
      `📊 Retrieved ${result.data?.length || 0} total mining-related reports`
    );

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch reports");
    }

    return result.data || [];
  } catch (error) {
    console.error("Error fetching all mining reports:", error);
    return [];
  }
}

/**
 * Format date for display
 */
export function formatTopicDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Get relative time description (e.g., "3 days ago")
 */
export function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "วันนี้";
    if (diffInDays === 1) return "เมื่อวาน";
    if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} สัปดาห์ที่แล้ว`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} เดือนที่แล้ว`;
    return `${Math.floor(diffInDays / 365)} ปีที่แล้ว`;
  } catch {
    return dateString;
  }
}

/**
 * Fetch nearby citizen reports for a specific location
 * Backend automatically filters for mining-related posts using keyword "เหมือง"
 */
export const fetchNearbyCitizenReports = async (location: {
  lat: number;
  lng: number;
}): Promise<CitizenReport[]> => {
  // Check if citizen reports are disabled
  if (!ENABLE_CITIZEN_REPORTS) {
    console.log("📋 Citizen reports disabled via environment variable");
    return [];
  }

  try {
    console.log(
      "🌐 Fetching mining-related citizen reports from:",
      `${API_BASE_URL}/citizen-reports/nearby`
    );
    console.log("📍 Location:", location);
    console.log("🏷️ Backend filtering with keyword: เหมือง");

    const response = await fetch(`${API_BASE_URL}/citizen-reports/nearby`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      console.warn(
        `API responded with status ${response.status}, returning empty array`
      );
      return []; // Return empty array instead of throwing
    }

    const data = await response.json();
    console.log("✅ API Response:", data);
    console.log(
      `📊 Retrieved ${data.data?.length || data?.length || 0} mining-related reports`
    );
    return data.data || data || []; // Handle different response formats
  } catch (error) {
    console.error(
      "Error fetching nearby mining-related citizen reports:",
      error
    );
    return []; // Return empty array instead of throwing
  }
};
