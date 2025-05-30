// TypeScript interfaces for KokWatch API data

export interface KokWatchSurfaceWater {
  saveDate: string;
  AS: string; // Arsenic
  Cd: string; // Cadmium
  Cu: string; // Copper
  Fe: string; // Iron
  Pb: string; // Lead
  Mn: string; // Manganese
  Ni: string; // Nickel
  Cr: string; // Chromium
  Zn: string; // Zinc
  Hg: string; // Mercury
  Cyanide: string;
}

export interface KokWatchSediment {
  saveDate: string;
  AS: string; // Arsenic
  Cd: string; // Cadmium
  Cu: string; // Copper
  Fe: string; // Iron
  Pb: string; // Lead
  Mn: string; // Manganese
  Ni: string; // Nickel
  Cr: string; // Chromium
  Zn: string; // Zinc
  Hg: string; // Mercury
  Cyanide: string;
}

export interface KokWatchPCDPoint {
  id: number;
  name: string;
  area: string;
  lat: number;
  lng: number;
  surface_water: KokWatchSurfaceWater[];
  sediment: KokWatchSediment[];
}

export interface KokWatchMaeFahLuangData {
  saveDate: string;
  AS: string; // Arsenic level
}

export interface KokWatchMaeFahLuangPoint {
  name: string;
  area: string;
  lat: number;
  lng: number;
  note: string;
  data: KokWatchMaeFahLuangData[];
}

export interface KokWatchAPIResponse {
  status: string;
  data: {
    pcd_data: KokWatchPCDPoint[];
    maefahluang_data: KokWatchMaeFahLuangPoint[];
  };
  message: string;
}

// Helper function to parse arsenic value and determine contamination level
export const parseArsenicValue = (value: string): number => {
  if (!value || value === "ไม่พบสารหนูเกินค่ามาตรฐาน") return 0;

  // Remove < or * symbols and parse as float
  const cleanValue = value.replace(/[<*]/g, "");
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

// Determine contamination level based on arsenic concentration
export const getContaminationLevel = (
  arsenicValue: number
): {
  level: "safe" | "warning" | "danger" | "critical";
  color: string;
  label: string;
} => {
  if (arsenicValue <= 0.01) {
    return { level: "safe", color: "#48BB78", label: "ปลอดภัย" };
  } else if (arsenicValue <= 0.02) {
    return { level: "warning", color: "#ED8936", label: "เฝ้าระวัง" };
  } else if (arsenicValue <= 0.05) {
    return { level: "danger", color: "#E53E3E", label: "อันตราย" };
  } else {
    return { level: "critical", color: "#9B2C2C", label: "วิกฤต" };
  }
};
