// Environment configuration with fallbacks
export const env = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",

  // Google Analytics
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || "",

  // SEO Configuration
  siteUrl: import.meta.env.VITE_SITE_URL || "https://minenearme2025.vercel.app",
  siteName: import.meta.env.VITE_SITE_NAME || "MineNearMe 2025",
  defaultShareImage:
    import.meta.env.VITE_DEFAULT_SHARE_IMAGE || "/assets/case-1-hero.jpg",

  // Features
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== "false",
  enableSeoTracking: import.meta.env.VITE_ENABLE_SEO_TRACKING !== "false",

  // Development flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// SEO defaults
export const seoDefaults = {
  title: "เหมืองใกล้ฉัน 2025 - แพลตฟอร์มติดตามผลกระทบเหมืองแร่",
  description:
    "แพลตฟอร์มติดตามผลกระทบจากเหมืองแร่ พร้อมแผนที่โต้ตอบ กรณีศึกษา และการตรวจสอบคุณภาพน้ำแบบเรียลไทม์ เพื่อความโปร่งใสและการมีส่วนร่วมของชุมชน",
  keywords:
    "เหมืองแร่, ผลกระทบสิ่งแวดล้อม, แผนที่, ติดตามมลพิษ, คุณภาพน้ำ, mining, environmental impact, Thailand, community monitoring, water quality",
  author: "MineNearMe Team",
  locale: "th_TH",
  type: "website",
} as const;

export default env;
