import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "เหมืองใกล้ฉัน 2025 - แพลตฟอร์มติดตามผลกระทบเหมืองแร่",
  description = "แพลตฟอร์มติดตามผลกระทบจากเหมืองแร่ พร้อมแผนที่โต้ตอบ กรณีศึกษา และการตรวจสอบคุณภาพน้ำแบบเรียลไทม์ เพื่อความโปร่งใสและการมีส่วนร่วมของชุมชน",
  keywords = "เหมืองแร่, ผลกระทบสิ่งแวดล้อม, แผนที่, ติดตามมลพิษ, คุณภาพน้ำ, mining, environmental impact, Thailand, community monitoring, water quality",
  image = "https://minenearme2025.vercel.app/assets/case-1-hero.jpg",
  url = "https://minenearme2025.vercel.app/",
  type = "website",
  siteName = "MineNearMe 2025",
  locale = "th_TH",
  author = "MineNearMe Team",
  publishedTime,
  modifiedTime,
  section,
  tags,
  noIndex = false,
}) => {
  const currentUrl = url || window.location.href;
  const imageUrl = image.startsWith("http")
    ? image
    : `https://minenearme2025.vercel.app${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* OpenGraph Tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={locale} />

      {/* Article specific tags */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {type === "article" && section && (
        <meta property="article:section" content={section} />
      )}
      {type === "article" &&
        tags &&
        tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={title} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Additional SEO optimizations */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </Helmet>
  );
};

export default SEOHead;
