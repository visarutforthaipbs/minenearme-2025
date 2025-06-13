import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  fetchNearbyCitizenReports,
  type CitizenReport,
} from "../../services/csiteApi";
import type { Feature } from "geojson";

interface CitizenReportsProps {
  mineFeature?: Feature | null;
  isVisible?: boolean;
}

// Simple cache to prevent duplicate requests
const cache = new Map<string, { data: CitizenReport[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const CitizenReports: React.FC<CitizenReportsProps> = ({
  mineFeature,
  isVisible = true,
}) => {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const requestIdRef = useRef<number>(0);

  // Extract coordinates from mine feature
  const extractMineCoordinates = useCallback(
    (feature: Feature | null): { lat: number; lng: number } | null => {
      if (!feature?.geometry) return null;

      try {
        if (feature.geometry.type === "Point") {
          const [lng, lat] = feature.geometry.coordinates;
          return { lat, lng };
        } else if (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon"
        ) {
          // For polygons, get the centroid (simplified approach)
          let coordinates;
          if (feature.geometry.type === "Polygon") {
            coordinates = feature.geometry.coordinates[0];
          } else {
            coordinates = feature.geometry.coordinates[0][0];
          }

          if (coordinates && coordinates.length > 0) {
            // Calculate centroid
            let latSum = 0,
              lngSum = 0;
            coordinates.forEach(([lng, lat]) => {
              latSum += lat;
              lngSum += lng;
            });
            return {
              lat: latSum / coordinates.length,
              lng: lngSum / coordinates.length,
            };
          }
        }
      } catch (error) {
        console.error("Error extracting coordinates from mine feature:", error);
      }

      return null;
    },
    []
  );

  // Memoize mine location to prevent unnecessary re-renders
  const mineLocation = useMemo(() => {
    return mineFeature ? extractMineCoordinates(mineFeature) : null;
  }, [mineFeature, extractMineCoordinates]);

  // Create cache key from coordinates
  const cacheKey = useMemo(() => {
    if (!mineLocation) return null;
    return `${mineLocation.lat.toFixed(6)}_${mineLocation.lng.toFixed(6)}`;
  }, [mineLocation]);

  const loadReports = useCallback(async () => {
    if (!mineLocation || !cacheKey) return;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("📋 Using cached citizen reports for:", mineLocation);
      setReports(cached.data);
      return;
    }

    // Generate unique request ID to handle race conditions
    const currentRequestId = ++requestIdRef.current;

    console.log("🔍 Loading citizen reports for mine location:", mineLocation);
    setLoading(true);
    setError(null);

    try {
      const reportsData = await fetchNearbyCitizenReports(mineLocation);

      // Only update state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        console.log("📋 Received citizen reports:", reportsData);
        setReports(reportsData);

        // Cache the results
        cache.set(cacheKey, { data: reportsData, timestamp: Date.now() });
      }
    } catch (err) {
      // Only update error state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        console.error("❌ Error fetching citizen reports:", err);
        setError(err instanceof Error ? err.message : "Failed to load reports");
      }
    } finally {
      // Only update loading state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [mineLocation, cacheKey]);

  useEffect(() => {
    // Only load reports when the panel is opened and we have a location
    if (mineLocation && isOpen && !loading) {
      // Check if we already have cached data
      if (cacheKey) {
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log(
            "📋 Using cached citizen reports immediately for:",
            mineLocation
          );
          setReports(cached.data);
          return;
        }
      }

      // Add a small delay to prevent rapid firing
      const timeoutId = setTimeout(() => {
        loadReports();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [mineLocation, isOpen, loadReports, cacheKey]);

  if (!isVisible || !mineLocation) return null;

  return (
    <div className="citizen-reports">
      <div
        className="citizen-reports-header"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          backgroundColor: "#f8f9fa",
          border: "1px solid #e9ecef",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: isOpen ? "12px" : "0",
          transition: "all 0.2s ease",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: "600",
            color: "#2c3e50",
          }}
        >
          ค้นหารายงานประชาชนใกล้เคียง ({reports.length})
        </h3>
        <span style={{ fontSize: "14px", color: "#6c757d" }}>
          {isOpen ? "▼" : "▶"}
        </span>
      </div>

      {isOpen && (
        <div className="citizen-reports-content">
          {loading ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "#6c757d",
                fontSize: "14px",
              }}
            >
              กำลังโหลดรายงานจากประชาชน...
            </div>
          ) : error ? (
            <div
              style={{
                padding: "16px",
                color: "#dc3545",
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                borderRadius: "8px",
                marginBottom: "12px",
                fontSize: "14px",
              }}
            >
              เกิดข้อผิดพลาดในการโหลดรายงาน: {error}
            </div>
          ) : reports.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "#6c757d",
                fontSize: "14px",
              }}
            >
              ไม่พบรายงานจากประชาชนในรัศมี 30 กิโลเมตร
            </div>
          ) : (
            <div className="reports-list">
              {reports.map((report, index) => (
                <div
                  key={report.id || index}
                  style={{
                    padding: "16px",
                    border: "1px solid #e9ecef",
                    borderRadius: "12px",
                    marginBottom: "16px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px rgba(0,0,0,0.05)";
                  }}
                >
                  {/* Header with image if available */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    {report.images && report.images.length > 0 && (
                      <div style={{ flexShrink: 0 }}>
                        <img
                          src={
                            report.images[0].post_img_thumb_wm_path ||
                            report.images[0].post_img_original_path
                          }
                          alt="รูปประกอบรายงาน"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #e9ecef",
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "15px",
                          fontWeight: "600",
                          lineHeight: "1.4",
                          color: "#2c3e50",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {report.title}
                      </h4>

                      {report.content && (
                        <p
                          style={{
                            margin: "0 0 8px 0",
                            fontSize: "13px",
                            color: "#5a6c7d",
                            lineHeight: "1.5",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {report.content}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                      fontSize: "12px",
                      color: "#6c757d",
                      marginBottom: "8px",
                      paddingTop: "8px",
                      borderTop: "1px solid #f8f9fa",
                    }}
                  >
                    {report.date && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        📅{" "}
                        {new Date(report.date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    {report.distance && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        📍 ระยะทาง {report.distance.toFixed(1)} กม.
                      </span>
                    )}
                    {report.author && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        👤 {report.author}
                      </span>
                    )}
                  </div>

                  {/* Media indicators */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    {report.images && report.images.length > 0 && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#28a745",
                          backgroundColor: "#d4edda",
                          padding: "2px 6px",
                          borderRadius: "12px",
                          fontWeight: "500",
                        }}
                      >
                        📷 {report.images.length} ภาพ
                      </span>
                    )}
                    {report.videos && report.videos.length > 0 && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#dc3545",
                          backgroundColor: "#f8d7da",
                          padding: "2px 6px",
                          borderRadius: "12px",
                          fontWeight: "500",
                        }}
                      >
                        🎥 {report.videos.length} วิดีโอ
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {report.tags && report.tags.length > 0 && (
                    <div style={{ marginBottom: "12px" }}>
                      {report.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          style={{
                            display: "inline-block",
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            marginRight: "4px",
                            marginBottom: "4px",
                            fontWeight: "500",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {report.tags.length > 3 && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#6c757d",
                            marginLeft: "4px",
                          }}
                        >
                          +{report.tags.length - 3} เพิ่มเติม
                        </span>
                      )}
                    </div>
                  )}

                  {/* External link */}
                  {report.externalUrl && (
                    <div style={{ textAlign: "right" }}>
                      <a
                        href={report.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#007bff",
                          textDecoration: "none",
                          fontSize: "12px",
                          fontWeight: "600",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #e9ecef",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#e9ecef";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8f9fa";
                        }}
                      >
                        อ่านรายงานฉบับเต็ม →
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CitizenReports;
