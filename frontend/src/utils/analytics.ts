// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Analytics Event Types
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// Track page views
export const trackPageView = (url: string, title: string) => {
  window.gtag("event", "page_view", {
    page_path: url,
    page_title: title,
    page_location: window.location.href,
  });
};

// Track custom events
export const trackEvent = ({
  action,
  category,
  label,
  value,
}: AnalyticsEvent) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track case study views
export const trackCaseStudyView = (caseId: string, caseTitle: string) => {
  trackEvent({
    action: "view_case_study",
    category: "Case Studies",
    label: `${caseId} - ${caseTitle}`,
  });
};

// Track map interactions
export const trackMapInteraction = (
  interactionType: string,
  details?: string
) => {
  trackEvent({
    action: "map_interaction",
    category: "Map",
    label: `${interactionType}${details ? ` - ${details}` : ""}`,
  });
};

// Track citizen reports
export const trackCitizenReport = (reportType: string, location: string) => {
  trackEvent({
    action: "citizen_report",
    category: "Citizen Reports",
    label: `${reportType} - ${location}`,
  });
};
