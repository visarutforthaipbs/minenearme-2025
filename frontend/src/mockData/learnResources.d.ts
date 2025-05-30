// TypeScript declarations for learnResources.js

export interface LearnResource {
  id: number;
  category: "laws" | "eia" | "rights" | "impact" | "standards";
  title: string;
  summary: string;
  content: string;
  downloadUrl: string;
}

export interface AdditionalResource {
  id: number;
  title: string;
  type: "guide" | "video";
  fileUrl?: string;
  videoUrl?: string;
}

export const learnResources: LearnResource[];
export const additionalResources: AdditionalResource[];
