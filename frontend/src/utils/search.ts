// Utility functions for searching mines and geospatial data

import {
  activeMinesData,
  potentialZonesData,
  riskZonesData,
} from "../mockData/mineData.js";

// Define GeoJSON feature type
interface GeoJSONFeature {
  type: string;
  properties: {
    id: number;
    name: string;
    [key: string]: string | number | boolean;
  };
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
}

// Define types for search
export interface SearchResult {
  id: number;
  name: string;
  type: "mine" | "potential" | "risk";
  properties: Record<string, string | number | boolean>;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
}

/**
 * Search across all geospatial data (mines, potential zones, risk zones)
 * @param query The search term to look for
 * @returns Array of matched search results
 */
export const searchAllData = (query: string): SearchResult[] => {
  if (!query || query.trim() === "") {
    return [];
  }

  // Convert query to lowercase for case-insensitive search
  const searchTerm = query.toLowerCase();
  const results: SearchResult[] = [];

  // Search in active mines
  activeMinesData.features.forEach((feature: GeoJSONFeature) => {
    const name = feature.properties.name.toLowerCase();
    const mineral = String(feature.properties.mineral).toLowerCase();
    const company = String(feature.properties.company || "").toLowerCase();

    if (
      name.includes(searchTerm) ||
      mineral.includes(searchTerm) ||
      company.includes(searchTerm)
    ) {
      results.push({
        id: feature.properties.id,
        name: feature.properties.name,
        type: "mine",
        properties: feature.properties,
        geometry: feature.geometry,
      });
    }
  });

  // Search in potential zones
  potentialZonesData.features.forEach((feature: GeoJSONFeature) => {
    const name = feature.properties.name.toLowerCase();
    const mineral = String(feature.properties.mineral).toLowerCase();

    if (name.includes(searchTerm) || mineral.includes(searchTerm)) {
      results.push({
        id: feature.properties.id,
        name: feature.properties.name,
        type: "potential",
        properties: feature.properties,
        geometry: feature.geometry,
      });
    }
  });

  // Search in risk zones
  riskZonesData.features.forEach((feature: GeoJSONFeature) => {
    const name = feature.properties.name.toLowerCase();
    const riskType = String(feature.properties.risk_type).toLowerCase();

    if (name.includes(searchTerm) || riskType.includes(searchTerm)) {
      results.push({
        id: feature.properties.id,
        name: feature.properties.name,
        type: "risk",
        properties: feature.properties,
        geometry: feature.geometry,
      });
    }
  });

  return results;
};

/**
 * Get color and icon for different search result types
 * @param type The type of search result
 * @returns Object with color and icon name
 */
export const getSearchResultTypeInfo = (
  type: "mine" | "potential" | "risk"
) => {
  switch (type) {
    case "mine":
      return { color: "orange", icon: "⛏️" };
    case "potential":
      return { color: "green", icon: "🔍" };
    case "risk":
      return { color: "red", icon: "⚠️" };
    default:
      return { color: "gray", icon: "❓" };
  }
};

/**
 * Format properties into human-readable strings based on result type
 * @param result The search result to format
 * @returns Object with formatted properties
 */
export const formatSearchResultDetails = (result: SearchResult) => {
  if (result.type === "mine") {
    return {
      title: `เหมือง: ${result.name}`,
      details: [
        { label: "แร่", value: result.properties.mineral },
        { label: "บริษัท", value: result.properties.company },
        {
          label: "สถานะ",
          value: result.properties.status === "active" ? "เปิดใช้งาน" : "ปิด",
        },
        {
          label: "คะแนนผลกระทบ",
          value: `${result.properties.impact_score}/10`,
        },
        {
          label: "เปิดดำเนินการ",
          value: `ปี ${result.properties.year_opened}`,
        },
      ],
    };
  } else if (result.type === "potential") {
    return {
      title: `โซนศักยภาพ: ${result.name}`,
      details: [
        { label: "แร่", value: result.properties.mineral },
        {
          label: "คะแนนศักยภาพ",
          value: `${result.properties.potential_score}/10`,
        },
        { label: "ปริมาณสำรอง", value: result.properties.estimated_reserves },
      ],
    };
  } else if (result.type === "risk") {
    return {
      title: `โซนเสี่ยง: ${result.name}`,
      details: [
        { label: "ประเภทความเสี่ยง", value: result.properties.risk_type },
        { label: "ระดับความเสี่ยง", value: result.properties.risk_level },
        {
          label: "หมู่บ้านที่ได้รับผลกระทบ",
          value: result.properties.affected_villages,
        },
        { label: "วันที่รายงาน", value: result.properties.reported_date },
      ],
    };
  }

  return { title: result.name, details: [] };
};
