// Google Analytics service for tracking user interactions
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
  custom_parameters?: Record<string, unknown>;
}

interface PageViewData {
  page_title: string;
  page_location: string;
  content_group1?: string;
  content_group2?: string;
  custom_parameters?: Record<string, unknown>;
}

class AnalyticsService {
  private isEnabled: boolean = false;
  private measurementId: string = "";

  constructor() {
    // Check if Google Analytics is available
    this.isEnabled =
      typeof window !== "undefined" &&
      typeof window.gtag === "function" &&
      !!import.meta.env.VITE_GA_MEASUREMENT_ID;

    this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || "";

    if (this.isEnabled) {
      console.log("Google Analytics initialized with ID:", this.measurementId);
    } else {
      console.warn("Google Analytics not available or measurement ID not set");
    }
  }

  // Initialize Google Analytics with configuration
  initialize(measurementId?: string) {
    if (measurementId) {
      this.measurementId = measurementId;
    }

    if (!this.measurementId) {
      console.warn("Google Analytics measurement ID not provided");
      return;
    }

    // Load gtag script if not already loaded
    if (typeof window !== "undefined" && !window.gtag) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script);

      // Initialize dataLayer and gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args: unknown[]) {
        window.dataLayer.push(args);
      };

      window.gtag("js", new Date());
      window.gtag("config", this.measurementId, {
        page_title: document.title,
        page_location: window.location.href,
        content_group1: "Mining Impact Monitoring",
      });

      this.isEnabled = true;
      console.log("Google Analytics dynamically initialized");
    }
  }

  // Track page views
  trackPageView(data: Partial<PageViewData> = {}) {
    if (!this.isEnabled) return;

    const pageData: PageViewData = {
      page_title: document.title,
      page_location: window.location.href,
      content_group1: "Mining Impact Monitoring",
      ...data,
    };

    window.gtag("event", "page_view", pageData);
    console.log("Page view tracked:", pageData);
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    if (!this.isEnabled) return;

    const eventData = {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters,
    };

    window.gtag("event", event.action, eventData);
    console.log("Event tracked:", event.action, eventData);
  }

  // Specific tracking methods for common actions
  trackCaseStudyView(caseId: string, caseTitle: string) {
    this.trackEvent({
      action: "view_case_study",
      category: "Content",
      label: caseId,
      custom_parameters: {
        case_title: caseTitle,
        content_type: "case_study",
      },
    });
  }

  trackMapInteraction(action: string, layer?: string, location?: string) {
    this.trackEvent({
      action: "map_interaction",
      category: "Map",
      label: action,
      custom_parameters: {
        map_layer: layer,
        location: location,
        interaction_type: action,
      },
    });
  }

  trackSearchQuery(query: string, resultsCount: number) {
    this.trackEvent({
      action: "search",
      category: "Search",
      label: query,
      value: resultsCount,
      custom_parameters: {
        search_term: query,
        results_count: resultsCount,
      },
    });
  }

  trackCommentSubmission(caseId: string) {
    this.trackEvent({
      action: "submit_comment",
      category: "Engagement",
      label: caseId,
      custom_parameters: {
        case_id: caseId,
        engagement_type: "comment",
      },
    });
  }

  trackReportSubmission(caseId: string, reportType: string) {
    this.trackEvent({
      action: "submit_report",
      category: "Engagement",
      label: caseId,
      custom_parameters: {
        case_id: caseId,
        report_type: reportType,
        engagement_type: "report",
      },
    });
  }

  trackDownload(fileName: string, fileType: string, caseId?: string) {
    this.trackEvent({
      action: "download",
      category: "Content",
      label: fileName,
      custom_parameters: {
        file_name: fileName,
        file_type: fileType,
        case_id: caseId,
      },
    });
  }

  trackShare(platform: string, contentType: string, contentId: string) {
    this.trackEvent({
      action: "share",
      category: "Social",
      label: platform,
      custom_parameters: {
        platform: platform,
        content_type: contentType,
        content_id: contentId,
      },
    });
  }

  trackTimelineInteraction(
    eventIndex: number,
    eventTitle: string,
    caseId: string
  ) {
    this.trackEvent({
      action: "timeline_interaction",
      category: "Content",
      label: eventTitle,
      value: eventIndex,
      custom_parameters: {
        event_index: eventIndex,
        event_title: eventTitle,
        case_id: caseId,
        interaction_type: "timeline_event",
      },
    });
  }

  trackKokWatchDataView(monitoringPoint: string, contaminationLevel: string) {
    this.trackEvent({
      action: "view_kokwatch_data",
      category: "Monitoring",
      label: monitoringPoint,
      custom_parameters: {
        monitoring_point: monitoringPoint,
        contamination_level: contaminationLevel,
        data_source: "kokwatch",
      },
    });
  }

  // Track user flow and session information
  trackUserFlow(fromPage: string, toPage: string) {
    this.trackEvent({
      action: "page_navigation",
      category: "Navigation",
      label: `${fromPage} -> ${toPage}`,
      custom_parameters: {
        from_page: fromPage,
        to_page: toPage,
        navigation_type: "internal",
      },
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit: string) {
    this.trackEvent({
      action: "performance_metric",
      category: "Performance",
      label: metric,
      value: value,
      custom_parameters: {
        metric_name: metric,
        metric_value: value,
        metric_unit: unit,
      },
    });
  }

  // Set user properties
  setUserProperty(propertyName: string, value: string) {
    if (!this.isEnabled) return;

    window.gtag("config", this.measurementId, {
      [propertyName]: value,
    });

    console.log("User property set:", propertyName, value);
  }

  // Track conversion events
  trackConversion(conversionName: string, value?: number) {
    if (!this.isEnabled) return;

    const conversionData: Record<string, unknown> = {
      event_category: "Conversion",
    };

    if (value !== undefined) {
      conversionData.value = value;
    }

    window.gtag("event", conversionName, conversionData);
    console.log("Conversion tracked:", conversionName, conversionData);
  }
}

// Create and export a singleton instance
export const analytics = new AnalyticsService();

// Export the class for custom instances if needed
export default AnalyticsService;
