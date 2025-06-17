// Analytics utility for Google Analytics 4 integration

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  content_group1?: string;
  content_group2?: string;
  custom_parameters?: Record<string, unknown>;
}

interface PageViewEvent {
  page_title?: string;
  page_location?: string;
  content_group1?: string;
  content_group2?: string;
}

class Analytics {
  private initialized = false;
  private measurementId: string | null = null;

  initialize(measurementId: string): void {
    try {
      this.measurementId = measurementId;

      // Initialize dataLayer if it doesn't exist
      window.dataLayer = window.dataLayer || [];

      // Define gtag function
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
      };

      // Configure Google Analytics
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        // Enable enhanced measurement
        enhanced_measurement: true,
        // Set page title
        page_title: document.title,
        // Custom content groupings
        content_group1: "Mining Impact Monitoring",
      });

      this.initialized = true;
      console.log("✅ Google Analytics initialized with ID:", measurementId);
    } catch (error) {
      console.warn("⚠️ Failed to initialize Google Analytics:", error);
    }
  }

  trackPageView(params: PageViewEvent = {}): void {
    if (!this.isReady()) return;

    try {
      window.gtag("event", "page_view", {
        page_title: params.page_title || document.title,
        page_location: params.page_location || window.location.href,
        content_group1: params.content_group1 || "Mining Impact Monitoring",
        content_group2: params.content_group2,
      });

      console.log("📊 Page view tracked:", params);
    } catch (error) {
      console.warn("⚠️ Failed to track page view:", error);
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.isReady()) return;

    try {
      window.gtag("event", event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        content_group1: event.content_group1,
        content_group2: event.content_group2,
        ...event.custom_parameters,
      });

      console.log("📊 Event tracked:", event);
    } catch (error) {
      console.warn("⚠️ Failed to track event:", error);
    }
  }

  // Specific tracking methods for common actions
  trackCaseStudyView(caseId: string): void {
    this.trackEvent({
      action: "view_case_study",
      category: "Case Studies",
      label: caseId,
      content_group2: "Case Study Detail",
    });
  }

  trackMapInteraction(action: string, details?: Record<string, unknown>): void {
    this.trackEvent({
      action: `map_${action}`,
      category: "Map Interactions",
      content_group2: "Interactive Map",
      custom_parameters: details,
    });
  }

  trackCitizenReportView(reportId: string): void {
    this.trackEvent({
      action: "view_citizen_report",
      category: "Citizen Reports",
      label: reportId,
      content_group2: "Citizen Reports",
    });
  }

  trackSearchQuery(query: string, resultsCount: number): void {
    this.trackEvent({
      action: "search",
      category: "Search",
      label: query,
      value: resultsCount,
      content_group2: "Search Results",
    });
  }

  trackFileDownload(fileName: string, fileType: string): void {
    this.trackEvent({
      action: "download",
      category: "Downloads",
      label: fileName,
      content_group2: "File Downloads",
      custom_parameters: {
        file_type: fileType,
      },
    });
  }

  trackError(errorType: string, errorMessage: string): void {
    this.trackEvent({
      action: "error",
      category: "Errors",
      label: `${errorType}: ${errorMessage}`,
      content_group2: "Error Tracking",
    });
  }

  private isReady(): boolean {
    if (!this.initialized || !this.measurementId) {
      console.warn("⚠️ Google Analytics not initialized");
      return false;
    }

    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      console.warn("⚠️ Google Analytics gtag function not available");
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Convenience function for basic page tracking
export const trackPage = (
  pageName: string,
  additionalParams?: PageViewEvent
) => {
  analytics.trackPageView({
    page_title: `${pageName} | Mine Near Me`,
    content_group2: pageName,
    ...additionalParams,
  });
};

// Convenience function for basic event tracking
export const trackAction = (
  action: string,
  category: string,
  label?: string
) => {
  analytics.trackEvent({
    action,
    category,
    label,
  });
};

export default analytics;
