// TypeScript declarations for caseStudies.js

export interface CaseStudy {
  id: number;
  title: string;
  summary: string;
  tags: string[];
  image: string;
  year: number;
  impacts: string[];
  location: {
    lat: number;
    lng: number;
  };
  relatedDocuments: Array<{
    title: string;
    url: string;
  }>;
  content: string;
}

export const caseStudiesData: CaseStudy[];
