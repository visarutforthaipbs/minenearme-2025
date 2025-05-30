// TypeScript declarations for reportData.js

export interface ImpactReport {
  id: number;
  title: string;
  location: {
    lat: number;
    lng: number;
  };
  impactTypes: string[];
  status: "verified" | "pending" | "rejected";
  date: string;
  description: string;
  reporter: {
    name: string;
    contact: string;
    verified: boolean;
  };
  evidence: string[];
  responseStatus: "investigating" | "addressed" | "no_action";
  nearbyMines: number[];
}

export interface ResponseAction {
  reportId: number;
  actions: Array<{
    date: string;
    actor: string;
    action: string;
    status: "completed" | "in_progress";
  }>;
}

export const impactReports: ImpactReport[];
export const responseActions: ResponseAction[];
