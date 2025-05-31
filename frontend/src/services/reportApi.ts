// API service for impact reports
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production"
    ? "https://minenearme-backend.onrender.com/api"
    : "http://localhost:3000/api");

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface ReportFormData {
  position: { lat: number; lng: number };
  impactTypes: string[];
  details: string;
  contact: string;
  files?: FileList | null;
}

export interface CaseReportFormData {
  details: string;
  name?: string;
  contact?: string;
}

export interface PaginatedReports {
  reports: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Submit a new impact report
export const submitReport = async (
  formData: FormData
): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    body: formData, // FormData handles multipart automatically
  });

  return response.json();
};

// Get all reports with optional filtering
export const getReports = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  impactType?: string;
  responseStatus?: string;
}): Promise<ApiResponse<PaginatedReports>> => {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE_URL}/reports${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const response = await fetch(url);

  return response.json();
};

// Get a specific report by ID
export const getReport = async (id: string): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/reports/${id}`);
  return response.json();
};

// Get reports near a location
export const getNearbyReports = async (
  lat: number,
  lng: number,
  radius?: number
): Promise<ApiResponse<any>> => {
  const url = `${API_BASE_URL}/reports/nearby/${lat}/${lng}${radius ? `?radius=${radius}` : ""}`;
  const response = await fetch(url);
  return response.json();
};

// Get response actions for a report
export const getResponseActions = async (
  reportId: string
): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/actions`);
  return response.json();
};

// Helper function to create FormData from ReportFormData
export const createReportFormData = (data: ReportFormData): FormData => {
  const formData = new FormData();

  // Add position as JSON string
  formData.append("position", JSON.stringify(data.position));

  // Add impact types as JSON string
  formData.append("impactTypes", JSON.stringify(data.impactTypes));

  // Add text fields
  formData.append("details", data.details);
  formData.append("contact", data.contact);

  // Add files if present
  if (data.files) {
    Array.from(data.files).forEach((file) => {
      formData.append("files", file);
    });
  }

  return formData;
};

// Health check
export const healthCheck = async (): Promise<{
  status: string;
  message: string;
  timestamp: string;
}> => {
  const response = await fetch(`${API_BASE_URL.replace("/api", "")}/health`);
  return response.json();
};

// Submit case-specific additional information report
export const submitCaseReport = async (
  caseId: string,
  data: CaseReportFormData
): Promise<ApiResponse<any>> => {
  const url = `${API_BASE_URL}/reports/case/${caseId}`;
  console.log("API_BASE_URL:", API_BASE_URL);
  console.log("Request URL:", url);
  console.log("Request data:", data);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error text:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("Response data:", result);
    return result;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// Get all reports for a specific case
export const getCaseReports = async (
  caseId: string,
  params?: { page?: number; limit?: number }
): Promise<ApiResponse<any>> => {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE_URL}/reports/case/${caseId}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const response = await fetch(url);

  return response.json();
};
