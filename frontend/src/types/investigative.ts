// Types for enhanced investigative features

export interface EnhancedMineData {
  id: number;
  name: string;
  mineral: string;
  country: string;
  year_opened: number;
  year_closed?: number;
  status: "active" | "closed" | "suspended" | "pending";
  location: {
    lat: number;
    lng: number;
  };
  company: string;
  production?: string;
  permit_number?: string;
  environmental_impact?: string;
  community_impact?: string;
  contamination_risk?: "low" | "medium" | "high" | "severe";
  proximity_to_water?: number; // meters
  proximity_to_schools?: number; // meters
  proximity_to_hospitals?: number; // meters
  description?: string;
}

export interface AdvancedFilters {
  country: string;
  yearRange: [number, number];
  mineral: string[];
  status: string[];
  company: string;
  contaminationRisk: string[];
  proximityToWater: number; // max distance in km
  proximityToSchools: number; // max distance in km
  productionRange: [number, number];
  searchQuery: string;
}

export interface AnalyticsData {
  totalMines: number;
  activeMines: number;
  closedMines: number;
  suspendedMines: number;
  minesByMineral: Record<string, number>;
  minesByCountry: Record<string, number>;
  minesByDecade: Record<string, number>;
  companiesWithMostMines: Array<{ company: string; count: number }>;
  highRiskMines: number;
  minesNearWater: number;
  minesNearSchools: number;
  timelineData: Array<{
    year: number;
    opened: number;
    closed: number;
    cumulative: number;
  }>;
}

export interface CrossBorderAnalysis {
  borderMines: EnhancedMineData[];
  transboundaryRisks: Array<{
    mineId: number;
    riskType: string;
    affectedCountries: string[];
    description: string;
  }>;
  sharedWaterSources: Array<{
    waterSourceName: string;
    affectedMines: number[];
    countries: string[];
  }>;
}

export interface ResearchNote {
  id: string;
  mineId: number;
  title: string;
  content: string;
  tags: string[];
  importance: "low" | "medium" | "high";
  dateCreated: Date;
  lastModified: Date;
}

export interface ExportOptions {
  format: "csv" | "xlsx" | "geojson" | "pdf-report";
  includeAnalytics: boolean;
  includeNotes: boolean;
  includeCitations: boolean;
  dateRange?: [Date, Date];
  selectedMines?: number[];
}

export interface CitationData {
  dataSource: string;
  lastUpdated: Date;
  methodology: string;
  reliability: "high" | "medium" | "low";
  url?: string;
}
