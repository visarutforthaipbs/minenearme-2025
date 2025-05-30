// Type declarations for mineData.js
import type { FeatureCollection, Point, Polygon } from "geojson";

interface MineProperties {
  id: number;
  name: string;
  mineral: string;
  status: string;
  year_opened: number;
  year_closed?: number;
  production: string;
  company: string;
  description: string;
  [key: string]: string | number | boolean | undefined;
}

interface PotentialZoneProperties {
  id: number;
  name: string;
  mineral: string;
  probability: string;
  estimated_reserve: string;
  description: string;
  [key: string]: string | number | boolean | undefined;
}

interface RiskZoneProperties {
  id: number;
  name: string;
  risk_type: string;
  risk_level: string;
  affected_communities: string;
  contaminants: string;
  description: string;
  [key: string]: string | number | boolean | undefined;
}

export declare const activeMinesData: FeatureCollection<Point, MineProperties>;
export declare const potentialZonesData: FeatureCollection<
  Polygon,
  PotentialZoneProperties
>;
export declare const riskZonesData: FeatureCollection<
  Polygon,
  RiskZoneProperties
>;
