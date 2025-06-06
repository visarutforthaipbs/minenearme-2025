import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Grid,
  Badge,
  VStack,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  useColorModeValue,
  Link,
  Tooltip,
  IconButton,
  Spinner,
  useToast,
  Input,
} from "@chakra-ui/react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LayersControl,
  GeoJSON,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useParams } from "react-router-dom";
import { caseStudies, getCaseStudyById } from "../data/caseData";
import {
  FaUsers,
  FaExclamationTriangle,
  FaThumbsUp,
  FaClock,
  FaExternalLinkAlt,
  FaDownload,
  FaShare,
  FaFilePdf,
  FaFileExcel,
  FaFileCode,
  FaInfoCircle,
  FaHome,
  FaChartLine,
  FaFacebookF,
  FaLine,
  FaCopy,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import TimelineCarousel from "../components/TimelineCarousel";
import type { Feature, Polygon } from "geojson";
import {
  commentsApi,
  type Comment as ApiComment,
} from "../services/commentsApi";
import {
  submitCaseReport,
  type CaseReportFormData,
} from "../services/reportApi";
import KokWatchMonitoringLayer from "../components/Map/KokWatchMonitoringLayer";
import type { KokWatchAPIResponse } from "../types/kokWatch";
import SEOHead from "../components/SEOHead";
import { analytics } from "../services/analytics";

// Add global CSS for Mekong River layer to ensure it's visible
const mekongRiverStyles = `
  .mekong-manual-line {
    z-index: 1000 !important; /* Ensure it's on top */
    stroke-linecap: round;
    stroke-linejoin: round;
    animation: mekongPulse 3s infinite;
  }
  
  .mekong-river-line {
    z-index: 999 !important;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  
  @keyframes mekongPulse {
    0% { stroke-width: 6px; }
    50% { stroke-width: 7px; }
    100% { stroke-width: 6px; }
  }
`;

// Define styles for map features
const polygonStyle = {
  fillColor: "transparent",
  color: "#C53030",
  weight: 3,
  opacity: 1,
  fillOpacity: 0,
};

// Custom marker icon based on impact level
const createVillageIcon = (impactLevel: string) => {
  let color = "#4299E1"; // blue - low impact

  if (impactLevel === "high") {
    color = "#E53E3E"; // red
  } else if (impactLevel === "medium") {
    color = "#ECC94B"; // yellow
  }

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

// Note: formatDate is now provided by the TimelineCarousel component

// Helper function to get icon for resource type
const getResourceIcon = (type: string) => {
  switch (type) {
    case "PDF":
      return FaFilePdf;
    case "Excel":
      return FaFileExcel;
    case "GeoJSON":
      return FaFileCode;
    default:
      return FaFilePdf;
  }
};

// Custom component to render the polygon line by line to avoid the cross-line issue
interface CustomPolygonRendererProps {
  data: Feature<Polygon>;
}

const CustomPolygonRenderer: React.FC<CustomPolygonRendererProps> = ({
  data,
}) => {
  const map = useMap();
  const linesRef = useRef<L.Polyline[]>([]);

  useEffect(() => {
    // Clear any previous lines
    linesRef.current.forEach((line) => {
      if (map && line) {
        line.removeFrom(map);
      }
    });
    linesRef.current = [];

    // If we have valid data, render the polygon as individual line segments
    if (
      data &&
      data.geometry &&
      data.geometry.coordinates &&
      data.geometry.coordinates[0]
    ) {
      const coords = data.geometry.coordinates[0];

      // Create a line for each segment of the polygon
      for (let i = 0; i < coords.length - 1; i++) {
        const line = L.polyline(
          [
            [coords[i][1], coords[i][0]], // Convert [lng, lat] to [lat, lng] for Leaflet
            [coords[i + 1][1], coords[i + 1][0]],
          ],
          {
            color: polygonStyle.color,
            weight: polygonStyle.weight,
            opacity: polygonStyle.opacity,
          }
        ).addTo(map);

        linesRef.current.push(line);
      }

      // Close the polygon by connecting last point to first
      if (coords.length > 2) {
        const line = L.polyline(
          [
            [coords[coords.length - 1][1], coords[coords.length - 1][0]],
            [coords[0][1], coords[0][0]],
          ],
          {
            color: polygonStyle.color,
            weight: polygonStyle.weight,
            opacity: polygonStyle.opacity,
          }
        ).addTo(map);

        linesRef.current.push(line);
      }

      // Only auto-fit bounds if our global bounds haven't been set yet
      if (!mapBoundsSet) {
        // Create a bounds object from all coordinates
        const bounds = L.latLngBounds(
          coords.map((coord) => [coord[1], coord[0]])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }

    // Cleanup on unmount
    return () => {
      linesRef.current.forEach((line) => {
        if (map && line) {
          line.removeFrom(map);
        }
      });
    };
  }, [data, map]);

  return null;
};

// Update the onEachMining function with better popup styling
const onEachMining = (feature: GeoJSON.Feature, layer: L.Layer) => {
  const properties = feature.properties;
  if (!properties) return;

  const title =
    properties.mineName ||
    (properties[" permitNumber"]
      ? properties[" permitNumber"].trim()
      : properties.permitNumber || "");

  // Create a more visually appealing popup with better styling
  const popupContent = `
    <div style="font-family: Arial, sans-serif; padding: 5px;">
      <h3 style="margin: 0 0 8px 0; color: #2C5282; font-size: 16px; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px;">${title}</h3>
      
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 5px; font-size: 13px;">
        <div style="font-weight: bold; color: #4A5568;">Mineral:</div>
        <div>${properties.mineral || "N/A"}</div>
        
        <div style="font-weight: bold; color: #4A5568;">Operator:</div>
        <div>${properties.operator || "N/A"}</div>
        
        <div style="font-weight: bold; color: #4A5568;">Status:</div>
        <div>${properties.status || "N/A"}</div>
        
        <div style="font-weight: bold; color: #4A5568;">Issue Date:</div>
        <div>${properties.issueDate || "N/A"}</div>
        
        <div style="font-weight: bold; color: #4A5568;">Expire Date:</div>
        <div>${properties.expireDate || "N/A"}</div>
        
        <div style="font-weight: bold; color: #4A5568;">Area:</div>
        <div>${properties.polyArea || "N/A"}</div>
        
        <div style="font-weight: bold; color: #4A5568;">Collected By:</div>
        <div>${properties.collectBy || "N/A"}</div>
      </div>
    </div>
  `;

  layer.bindPopup(popupContent, {
    maxWidth: 300,
    className: "custom-popup",
  });
};

// Also update the onEachRiver function with similar styling improvements
const onEachRiver = (feature: GeoJSON.Feature, layer: L.Layer) => {
  const properties = feature.properties;
  if (!properties) return;

  console.log("River feature geometry type:", feature.geometry?.type);

  const title = properties["Thai-name"] || "";
  const rivName = properties["RIV_NAME"] || properties["STR_NAM_T"] || "";
  const basin = properties["BASIN_NAME"] || properties["BAS_NAME"] || "";

  // Create a more visually appealing popup with better styling
  const popupContent = `
    <div style="font-family: Arial, sans-serif; padding: 5px;">
      <h3 style="margin: 0 0 8px 0; color: #2B6CB0; font-size: 16px; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px;">${title}</h3>
      
      <div style="display: grid; grid-template-columns: 80px 1fr; gap: 5px; font-size: 13px;">
        <div style="font-weight: bold; color: #4A5568;">River:</div>
        <div>${rivName || "N/A"}</div>
        
        <div style="font-weight: bold; color: #4A5568;">Basin:</div>
        <div>${basin || "N/A"}</div>
      </div>
    </div>
  `;

  layer.bindPopup(popupContent, {
    maxWidth: 250,
    className: "custom-popup",
  });
};

// Add CSS for custom popup styling
const popupStyles = `
  .custom-popup .leaflet-popup-content-wrapper {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 3px 14px rgba(0,0,0,0.2);
  }
  
  .custom-popup .leaflet-popup-tip {
    background-color: white;
  }
  
  .custom-popup .leaflet-popup-content {
    margin: 10px;
    min-width: 200px;
  }
  
  /* Ensure village markers are on top of other layers */
  .custom-marker {
    z-index: 1000 !important;
  }
`;

// Update the InitialMapView component with wider bounds
const InitialMapView: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Define the initial bounds to show POI - with wider area to include Mae Sai river
    const initialBounds = L.latLngBounds(
      L.latLng(19.8, 99.4), // Southwest corner - wider west
      L.latLng(20.6, 100.65) // Northeast corner - wider east and north
    );

    // Set initial bounds once with lower zoom
    map.fitBounds(initialBounds, { padding: [20, 20] });
    console.log(
      "Initial map view set to show points of interest and Mae Sai river"
    );
  }, [map]);

  return null;
};

// Update the MapInitializer to match the wider bounds
const MapInitializer: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    console.log("Map instance ready");

    // Set initial bounds for the area of interest - with wider view
    const areaOfInterest = L.latLngBounds(
      L.latLng(19.8, 99.4), // Southwest corner - wider west
      L.latLng(20.6, 100.65) // Northeast corner - wider east and north
    );

    // Set initial bounds
    map.fitBounds(areaOfInterest, { padding: [20, 20] });
    console.log(
      "Initial map bounds set to wider area to include Mae Sai river"
    );
    mapBoundsSet = true; // Mark bounds as set
  }, [map]);

  return null;
};

// Add this FetchGeoJSON component before the CaseDetail component
const FetchGeoJSON: React.FC<{
  url: string;
  render: (data: GeoJSON.FeatureCollection | null) => React.ReactNode;
}> = ({ url, render }) => {
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    let isMounted = true;
    console.log(`FetchGeoJSON: Fetching from ${url}`);

    fetch(url)
      .then((response) => response.json())
      .then((jsonData) => {
        if (isMounted) {
          console.log(
            `FetchGeoJSON: Loaded data with ${jsonData.features?.length || 0} features`
          );
          setData(jsonData);
        }
      })
      .catch((err) => {
        console.error(`FetchGeoJSON: Error loading ${url}:`, err);
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return <>{render(data)}</>;
};

// Add a global map bounds control flag
let mapBoundsSet = false;

// Add a new component for Mekong River manual rendering
const MekongRiverRenderer: React.FC<{
  data: GeoJSON.FeatureCollection;
  visible: boolean;
}> = ({ data, visible }) => {
  const map = useMap();
  const linesRef = useRef<L.Polyline[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Effect to handle cleanup
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      linesRef.current.forEach((line) => {
        if (map && line) {
          try {
            line.removeFrom(map);
          } catch (e) {
            console.error("Error removing line:", e);
          }
        }
      });
      linesRef.current = [];
    };
  }, [map]);

  // Separate effect to handle rendering
  useEffect(() => {
    if (!map || !visible) return;

    // Wait for map to be ready
    const timer = setTimeout(() => {
      try {
        console.log("MekongRiverRenderer: Drawing lines...");

        // Clear any previous lines first
        linesRef.current.forEach((line) => {
          if (map && line) {
            try {
              line.removeFrom(map);
            } catch (e) {
              console.error("Error removing line:", e);
            }
          }
        });
        linesRef.current = [];

        // Filter valid features
        const validFeatures = data.features.filter(
          (feature) =>
            feature.geometry && feature.geometry.type === "MultiLineString"
        );

        console.log(`Rendering Mekong River: ${validFeatures.length} features`);

        // Create lines for each valid feature
        validFeatures.forEach((feature, featureIndex) => {
          if (feature.geometry?.type === "MultiLineString") {
            const coordinates = feature.geometry.coordinates as number[][][];

            coordinates.forEach((lineString: number[][], lineIndex: number) => {
              try {
                // Convert coordinates [lng, lat] to [lat, lng] for Leaflet
                const latLngs = lineString.map((coord: number[]) => [
                  coord[1],
                  coord[0],
                ]);
                const line = L.polyline(latLngs as [number, number][], {
                  color: "#2054E5", // Slightly more subdued blue
                  weight: 6, // Reduced from 15 to 6 for a thinner line
                  opacity: 1,
                  className: "mekong-manual-line",
                });

                // Only add to map if we're ready
                try {
                  line.addTo(map);
                  // Add popup
                  line.bindPopup(`แม่น้ำโขง (Mekong River)`);
                  // Store for cleanup
                  linesRef.current.push(line);
                } catch (err) {
                  console.error("Error adding line to map:", err);
                }

                console.log(
                  `Added Mekong line segment ${featureIndex}-${lineIndex}`
                );
              } catch (err) {
                console.error("Error creating line:", err);
              }
            });
          }
        });

        // Mark as initialized but DO NOT set bounds
        if (!initialized) {
          setInitialized(true);
          console.log(
            "MekongRiverRenderer initialized without changing map bounds"
          );
        }
      } catch (err) {
        console.error("MekongRiverRenderer general error:", err);
      }
    }, 300); // Wait before rendering

    return () => clearTimeout(timer);
  }, [map, data, visible, initialized]);

  return null;
};

// GeoJSONLayer component to fetch and render GeoJSON data
interface GeoJSONLayerProps {
  url: string;
  visible: boolean;
  style: L.PathOptions;
  onEachFeature?: (feature: GeoJSON.Feature, layer: L.Layer) => void;
}

const GeoJSONLayer: React.FC<GeoJSONLayerProps> = ({
  url,
  visible,
  style,
  onEachFeature,
}) => {
  const [data, setData] = useState<GeoJSON.GeoJsonObject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const map = useMap();

  // Store the map reference
  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching GeoJSON from ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let jsonData;
        try {
          const text = await response.text();
          // Check if the data starts with a valid JSON structure
          const trimmedText = text.trim();
          if (!trimmedText.startsWith("{") && !trimmedText.startsWith("[")) {
            console.error(
              `Invalid GeoJSON format in ${url}: File does not start with { or [`
            );
            throw new Error(`Invalid GeoJSON format in ${url}`);
          }
          jsonData = JSON.parse(text);

          // Log the structure for debugging
          console.log(
            `${url} structure:`,
            jsonData.type,
            jsonData.features
              ? `Features: ${jsonData.features.length}`
              : "No features",
            jsonData.features?.[0]?.geometry?.type || "No geometry type"
          );

          // Validate if it has a proper structure
          if (!jsonData.type && !jsonData.features) {
            console.warn(
              `Missing type or features in GeoJSON from ${url}, attempting to fix`
            );
            // Try to fix it if it's a collection of coordinates - wrap it as a proper GeoJSON
            if (Array.isArray(jsonData)) {
              jsonData = {
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    properties: {},
                    geometry: {
                      type: "LineString",
                      coordinates: jsonData,
                    },
                  },
                ],
              };
            }
          }

          // Fix empty features array
          if (jsonData.features && jsonData.features.length === 0) {
            console.warn(`Empty features array in ${url}`);
          }

          // Fix empty geometry in MultiLineString - this happens in some files
          if (jsonData.features) {
            // For Mekong River, log full details before filtering
            if (url.includes("mekong-cliped")) {
              console.log("Mekong River GeoJSON loaded for debugging:");
              console.log(
                `Found ${jsonData.features.length} total features before filtering`
              );

              // Log each feature structure
              jsonData.features.forEach(
                (feature: GeoJSON.Feature, index: number) => {
                  console.log(`Feature ${index} type:`, feature.geometry?.type);
                  console.log(
                    `Feature ${index} coordinates:`,
                    feature.geometry && "coordinates" in feature.geometry
                      ? `Has ${(feature.geometry.coordinates as unknown[]).length} coordinate groups`
                      : "No coordinates"
                  );
                }
              );
            }

            // Less strict filtering for Mekong River
            if (url.includes("mekong-cliped")) {
              // Only filter out features with no geometry at all
              jsonData.features = jsonData.features.filter(
                (feature: GeoJSON.Feature) => {
                  if (
                    !feature.geometry ||
                    !("coordinates" in feature.geometry) ||
                    (Array.isArray(feature.geometry.coordinates) &&
                      feature.geometry.coordinates.length === 0)
                  ) {
                    console.warn(
                      `Filtering out feature with empty geometry in ${url}`
                    );
                    return false;
                  }
                  return true;
                }
              );
            } else {
              // Regular filtering for other layers
              jsonData.features = jsonData.features.filter(
                (feature: GeoJSON.Feature) => {
                  if (
                    !feature.geometry ||
                    !("coordinates" in feature.geometry) ||
                    (Array.isArray(feature.geometry.coordinates) &&
                      feature.geometry.coordinates.length === 0)
                  ) {
                    console.warn(
                      `Filtering out feature with empty geometry in ${url}`
                    );
                    return false;
                  }
                  return true;
                }
              );
            }

            // No bounds fitting - let the LockMapBounds component handle the map view
          }
        } catch (err) {
          const parseError = err as Error;
          console.error(`Error parsing GeoJSON from ${url}:`, parseError);
          throw new Error(`Error parsing GeoJSON: ${parseError.message}`);
        }

        console.log(`Successfully loaded GeoJSON from ${url}`);
        setData(jsonData);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching GeoJSON from ${url}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };

    if (visible) {
      fetchData();
    }

    // Cleanup function
    return () => {
      // Any cleanup code here
    };
  }, [url, visible, map]);

  if (!visible || loading || error || !data) {
    return null;
  }

  // Special rendering for Mekong River to make it more visible
  if (url.includes("mekong-cliped") && data.type === "FeatureCollection") {
    console.log("Using custom MekongRiverRenderer component");
    return (
      <MekongRiverRenderer
        data={data as GeoJSON.FeatureCollection}
        visible={visible}
      />
    );
  }

  return (
    <GeoJSON
      key={url}
      data={data}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
};

// Replace the VillageRiskLayer implementation with a simpler approach
const NearbyVillageLayer: React.FC<{
  url: string;
  visible: boolean;
}> = ({ url, visible }) => {
  const [geoJsonData, setGeoJsonData] =
    useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(
          `Loaded nearby village data with ${data.features?.length || 0} features`
        );
        setGeoJsonData(data);
      })
      .catch((err) =>
        console.error(`Error loading nearby village data: ${err}`)
      );

    return () => {
      // cleanup
    };
  }, [url, visible]);

  if (!visible || !geoJsonData) {
    return null;
  }

  return (
    <GeoJSON
      key={`nearby-villages-${Date.now()}`} // Force re-render when data changes
      data={geoJsonData}
      pointToLayer={(feature, latlng) => {
        const properties = feature.properties || {};
        const villageName =
          properties.VILLAGE_T ||
          properties.VILLAGE ||
          properties.NAME_T ||
          properties.NAME ||
          "หมู่บ้านไม่ทราบชื่อ";

        console.log(
          `Creating marker for nearby village ${villageName} at ${latlng.lat}, ${latlng.lng}`
        );

        // Create a popup with village information (no risk assessment)
        const popupContent = `
          <div style="font-family: Arial, sans-serif; padding: 5px;">
            <h3 style="margin: 0 0 8px 0; color: #2B6CB0; font-size: 16px; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px;">${villageName}</h3>
            <div style="display: grid; grid-template-columns: 80px 1fr; gap: 5px; font-size: 13px;">
              <div style="font-weight: bold; color: #4A5568;">ประเภท:</div>
              <div>หมู่บ้านใกล้เคียง</div>
              <div style="font-weight: bold; color: #4A5568;">ระยะห่าง:</div>
              <div>ภายในรัศมี 5 กม.</div>
            </div>
          </div>
        `;

        // Create the marker with a standard blue icon (no risk-based coloring)
        const marker = L.marker(latlng, {
          icon: createVillageIcon("low"), // Use blue icon for all nearby villages
          zIndexOffset: 1000, // Make sure village markers appear on top
        });

        // Add popup to marker
        marker.bindPopup(popupContent, {
          maxWidth: 250,
          className: "custom-popup",
        });

        return marker;
      }}
    />
  );
};

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [activeMapLayers, setActiveMapLayers] = useState({
    miningArea: true,
    villages: true,
  });

  // Add legend visibility state for mobile
  const [isLegendVisible, setIsLegendVisible] = useState(false);

  // Add KokWatch data state for case-6
  // const [kokWatchData, setKokWatchData] = useState<KokWatchAPIResponse | null>(
  //   null
  // );

  // MongoDB comments state
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentStats, setCommentStats] = useState({
    totalComments: 0,
    totalLikes: 0,
    avgLikes: 0,
  });

  // Add toast for user feedback
  const toast = useToast();

  // Add form state for case report
  const [reportFormData, setReportFormData] = useState({
    details: "",
    name: "",
    contact: "",
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Load comments from MongoDB
  useEffect(() => {
    const loadComments = async () => {
      if (!id) return;

      try {
        setCommentsLoading(true);
        setCommentsError(null);

        const [commentsResponse, statsResponse] = await Promise.all([
          commentsApi.getCommentsByCase(id),
          commentsApi.getCommentStats(id),
        ]);

        if (commentsResponse.success) {
          setComments(commentsResponse.data.comments);
        }

        if (statsResponse.success) {
          setCommentStats(statsResponse.data);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
        setCommentsError("ไม่สามารถโหลดความคิดเห็นได้");
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [id]);

  // Load KokWatch data for case-6
  useEffect(() => {
    const loadKokWatchData = async () => {
      if (id !== "case-6") return;

      try {
        const response = await fetch(
          "/api/kokwatch?token=0265026b95a4a0618f9a300776c823e3"
        );

        if (response.ok) {
          const result: KokWatchAPIResponse = await response.json();
          if (result.status === "success") {
            // setKokWatchData(result);
            console.log("KokWatch data loaded for pollution chart");
          }
        }
      } catch (error) {
        console.error("Error loading KokWatch data:", error);
      }
    };

    loadKokWatchData();
  }, [id]);

  // Inject the Mekong River styles and popup styles
  useEffect(() => {
    // Add the styles to the document head
    const styleElement = document.createElement("style");
    styleElement.innerHTML = mekongRiverStyles + popupStyles;
    document.head.appendChild(styleElement);

    // Clean up on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Base URL for assets
  const [baseUrl, setBaseUrl] = useState("");

  // Set base URL on component mount
  useEffect(() => {
    const url = window.location.origin;
    console.log("Setting base URL to:", url);
    setBaseUrl(url);

    // Log info about any GeoJSON issues for debugging
    console.log("Setting up for case ID:", id);
    if (id === "case-6") {
      console.log(
        "Case 6 detected, will load Mekong River and other GIS layers"
      );

      // Fetch and log Mekong river bounds for debugging
      fetch(`${url}/assets/data/case6/case-6-mekong-cliped.geojson`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Mekong River GeoJSON loaded for debugging:");
          if (data.features && data.features.length > 0) {
            console.log(`Found ${data.features.length} features`);

            // Calculate bounds from coordinates to help debug map centering
            let minLat = 90,
              maxLat = -90,
              minLng = 180,
              maxLng = -180;
            data.features.forEach((feature: GeoJSON.Feature) => {
              if (feature.geometry && "coordinates" in feature.geometry) {
                if (feature.geometry.type === "MultiLineString") {
                  (feature.geometry.coordinates as number[][][]).forEach(
                    (lineString: number[][]) => {
                      lineString.forEach((coord: number[]) => {
                        const [lng, lat] = coord;
                        minLat = Math.min(minLat, lat);
                        maxLat = Math.max(maxLat, lat);
                        minLng = Math.min(minLng, lng);
                        maxLng = Math.max(maxLng, lng);
                      });
                    }
                  );
                }
              }
            });
            console.log("Mekong River bounds:", {
              minLat,
              maxLat,
              minLng,
              maxLng,
            });
            console.log("Suggested center:", [
              (minLat + maxLat) / 2,
              (minLng + maxLng) / 2,
            ]);
          }
        })
        .catch((error) =>
          console.error("Error loading Mekong River GeoJSON:", error)
        );
    }
  }, [id]);

  // Add state for case 6 specific GeoJSON layers
  const [case6Layers, setCase6Layers] = useState({
    kokMining: true,
    saiMining: true,
    easternShanMining: true,
    kokRiver: true,
    measaiRiver: true,
    mekongRiver: true,
    ruakRiver: true,
    nearbyVillages: true,
    kokWatchMonitoring: true,
  });

  // Styles for river lines
  const riverStyles = {
    kok: { color: "#0078FF", weight: 3, opacity: 0.8 },
    mekong: { color: "#0000FF", weight: 4, opacity: 0.8 },
    measai: { color: "#00AAFF", weight: 2, opacity: 0.8 },
    ruak: { color: "#FF6B35", weight: 3, opacity: 0.8 },
  };

  // Styles for mining areas
  const miningStyles = {
    kok: {
      fillColor: "#FF0000",
      color: "#880000",
      weight: 1,
      fillOpacity: 0.4,
    },
    sai: {
      fillColor: "#FF6600",
      color: "#884400",
      weight: 1,
      fillOpacity: 0.4,
    },
    easternShan: {
      fillColor: "#FF0066",
      color: "#880044",
      weight: 1,
      fillOpacity: 0.4,
    },
  };

  // Debug log the ID from URL
  console.log("Case ID from URL:", id);

  // Get the case study data based on the ID from the URL
  const foundCase = id ? getCaseStudyById(id) : null;
  console.log("Found case:", foundCase?.id, foundCase?.title);

  // If no case found, default to first case
  const caseData = foundCase || caseStudies[0];

  // Track case study view when component mounts
  useEffect(() => {
    if (caseData && id) {
      analytics.trackCaseStudyView(String(caseData.id), caseData.title);

      // Track page view with case-specific data
      analytics.trackPageView({
        page_title: `${caseData.title} - เหมืองใกล้ฉัน 2025`,
        content_group1: "Case Studies",
        content_group2: String(caseData.id),
        custom_parameters: {
          case_id: String(caseData.id),
          case_title: caseData.title,
          case_year: caseData.year,
          case_tags: caseData.tags.join(","),
        },
      });
    }
  }, [caseData, id]);

  // Debug log the timeline events
  console.log("Timeline events:", caseData.timelineEvents?.length);

  // Default empty array for voices if they're undefined
  const voices = caseData.voices || [];

  // Default voice for the modal
  const defaultVoice =
    voices.length > 0
      ? voices[0]
      : { name: "", role: "", avatar: "", text: "" };

  // Modal for full interview
  const {
    isOpen: isInterviewOpen,
    onOpen: onInterviewOpen,
    onClose: onInterviewClose,
  } = useDisclosure();
  const [selectedVoice, setSelectedVoice] = useState(defaultVoice);

  // Modal for reporting
  const {
    isOpen: isReportOpen,
    onOpen: onReportOpen,
    onClose: onReportClose,
  } = useDisclosure();

  // Modal for impact assessment information
  const {
    isOpen: isImpactInfoOpen,
    onOpen: onImpactInfoOpen,
    onClose: onImpactInfoClose,
  } = useDisclosure();

  // Modal for social sharing
  const {
    isOpen: isShareOpen,
    onOpen: onShareOpen,
    onClose: onShareClose,
  } = useDisclosure();

  // Background colors
  const sectionBgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");

  // Handle form submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !feedbackText.trim()) return;

    try {
      const response = await commentsApi.createComment(id, {
        text: feedbackText.trim(),
        author: "ผู้ใช้งาน", // In a real app, this would come from user authentication
      });

      if (response.success) {
        // Add new comment to the beginning of the comments array
        setComments((prev) => [response.data, ...prev]);

        // Update stats
        setCommentStats((prev) => ({
          ...prev,
          totalComments: prev.totalComments + 1,
        }));

        // Show success message and reset form
        setShowFeedbackSuccess(true);
        setFeedbackText("");

        toast({
          title: "ส่งความคิดเห็นสำเร็จ",
          description: "ขอบคุณสำหรับความคิดเห็นของคุณ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowFeedbackSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งความคิดเห็นได้ กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle like comment
  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await commentsApi.likeComment(commentId);

      if (response.success) {
        // Update the comment in the local state
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? { ...comment, likes: response.data.likes }
              : comment
          )
        );

        toast({
          title: response.data.hasLiked ? "ถูกใจแล้ว" : "ยกเลิกการถูกใจแล้ว",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Open interview modal with null check or open URL if available
  const handleVoiceClick = (voice: typeof defaultVoice) => {
    if (voice.urlsource) {
      // Open the external URL in a new tab
      window.open(voice.urlsource, "_blank");
    } else {
      // Fallback to opening the modal if no URL is provided
      setSelectedVoice(voice);
      onInterviewOpen();
    }
  };

  // Add a useEffect to remove any problematic elements when the component mounts
  useEffect(() => {
    // Add a small delay to ensure the map is fully loaded
    const timer = setTimeout(() => {
      // Find and remove any diagonal lines that might be drawn across the map
      const mapContainer = document.querySelector(".leaflet-container");
      if (mapContainer) {
        const paths = mapContainer.querySelectorAll("path.leaflet-interactive");
        // Check for very long paths - likely the problematic diagonal line
        paths.forEach((path) => {
          // Use direct DOM attributes to check path length
          const d = path.getAttribute("d");
          if (d && d.length > 1000) {
            // Very long path data string - likely our diagonal line
            path.remove();
          }
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]); // Run when case changes

  // Update the toggleMapLayer function to force redraw
  const toggleMapLayer = (layer: "miningArea" | "villages") => {
    setActiveMapLayers((prev) => {
      // Remove any problematic elements first
      if (layer === "miningArea" && !prev.miningArea) {
        setTimeout(() => {
          const mapContainer = document.querySelector(".leaflet-container");
          if (mapContainer) {
            const paths = mapContainer.querySelectorAll(
              "path.leaflet-interactive"
            );
            paths.forEach((path) => {
              const d = path.getAttribute("d");
              if (d && d.length > 1000) {
                // Very long path data string - likely our diagonal line
                path.remove();
              }
            });
          }
        }, 200);
      }

      return { ...prev, [layer]: !prev[layer] };
    });
  };

  // Toggle case 6 specific layers
  const toggleCase6Layer = (layer: keyof typeof case6Layers) => {
    setCase6Layers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  // Add download report handler
  const handleDownloadReport = () => {
    // Add print styles for PDF generation
    const printStyles = document.createElement("style");
    printStyles.innerHTML = `
      @media print {
        /* Hide specific unwanted elements */
        .leaflet-control-container,
        .leaflet-control-layers,
        button,
        .modal-overlay,
        nav,
        header:not(.case-header),
        footer,
        .no-print { 
          display: none !important; 
        }
        
        /* Ensure main content is visible */
        body, html {
          height: auto !important;
          overflow: visible !important;
        }
        
        /* Optimize layout for printing */
        .leaflet-container { 
          height: 300px !important; 
          width: 100% !important;
          page-break-inside: avoid;
        }
        
        /* Better typography for print */
        h1, h2, h3 { 
          page-break-after: avoid;
          color: black !important;
        }
        
        .timeline-item, 
        .case-voice-card,
        .impact-card { 
          page-break-inside: avoid;
          margin-bottom: 1rem;
        }
        
        /* Ensure proper margins and layout */
        @page { 
          margin: 1.5cm;
          size: A4;
        }
        
        /* Force background colors and improve contrast */
        * { 
          -webkit-print-color-adjust: exact !important; 
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Ensure containers are full width */
        .container, .max-w-container {
          max-width: 100% !important;
          width: 100% !important;
        }
        
        /* Make sure all text is visible */
        .chakra-text,
        .chakra-heading,
        p, h1, h2, h3, h4, h5, h6 {
          color: black !important;
          opacity: 1 !important;
        }
        
        /* Fix card backgrounds */
        .chakra-card,
        .card-body {
          background: white !important;
          border: 1px solid #ccc !important;
        }
        
        /* Ensure spacing between sections */
        section, .section {
          margin-bottom: 2rem !important;
        }
      }
    `;

    document.head.appendChild(printStyles);

    toast({
      title: "กำลังสร้างรายงาน PDF",
      description: "กรุณารอสักครู่ จะเปิดหน้าต่างการพิมพ์...",
      status: "info",
      duration: 2000,
      isClosable: true,
    });

    // Small delay to ensure toast shows, then trigger print
    setTimeout(() => {
      window.print();

      // Cleanup after print
      setTimeout(() => {
        if (document.head.contains(printStyles)) {
          document.head.removeChild(printStyles);
        }
      }, 1000);
    }, 1000);
  };

  // Add social share handlers
  const handleSocialShare = (platform: string) => {
    const shareData = {
      title: caseData.title,
      text: `${caseData.summary} - ปี ${caseData.year}`,
      url: window.location.href,
    };

    const encodedUrl = encodeURIComponent(shareData.url);
    const encodedText = encodeURIComponent(shareData.text);
    const encodedTitle = encodeURIComponent(shareData.title);

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        // Use the simple Facebook sharer that works without App ID
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "line":
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "copy":
        handleCopyLink();
        return;
      case "native":
        handleNativeShare();
        return;
      default:
        return;
    }

    if (shareUrl) {
      // For Facebook, use a larger popup window
      const windowFeatures =
        platform === "facebook"
          ? "width=800,height=600,scrollbars=yes,resizable=yes"
          : "width=600,height=400";

      window.open(shareUrl, "_blank", windowFeatures);
      onShareClose();

      toast({
        title: "เปิดหน้าต่างแชร์แล้ว",
        description:
          platform === "facebook"
            ? "กรุณารอสักครู่ให้ Facebook โหลดข้อมูล จากนั้นดำเนินการแชร์"
            : "กรุณาดำเนินการแชร์ในหน้าต่างที่เปิดขึ้น",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      onShareClose();
      toast({
        title: "คัดลอกลิงก์แล้ว",
        description: "ลิงก์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      // Fallback: show the URL in a prompt
      const url = window.location.href;
      const userCopied = window.prompt("คัดลอกลิงก์นี้เพื่อแชร์:", url);
      if (userCopied !== null) {
        toast({
          title: "แชร์ลิงก์",
          description: "คุณสามารถนำลิงก์ไปแชร์ได้แล้ว",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: caseData.title,
      text: `${caseData.summary} - ปี ${caseData.year}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        onShareClose();
        toast({
          title: "แชร์สำเร็จ",
          description: "ขอบคุณที่แชร์กรณีศึกษานี้",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // If native share is not available, fallback to copy
        handleCopyLink();
      }
    } catch (error) {
      console.error("Error sharing:", error);
      handleCopyLink();
    }
  };

  // Handle case report submission
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submitted with data:", reportFormData);
    console.log("Details length:", reportFormData.details.length);
    console.log("Details content:", JSON.stringify(reportFormData.details));

    if (!id || !reportFormData.details.trim()) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "กรุณากรอกรายละเอียดเพิ่มเติม",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmittingReport(true);

    try {
      const reportData: CaseReportFormData = {
        details: reportFormData.details.trim(),
        name: reportFormData.name.trim() || undefined,
        contact: reportFormData.contact.trim() || undefined,
      };

      console.log("Sending report data:", reportData);

      const response = await submitCaseReport(id, reportData);

      if (response.success) {
        toast({
          title: "ส่งข้อมูลสำเร็จ",
          description:
            response.message ||
            "ข้อมูลของคุณถูกส่งเรียบร้อยแล้ว ทีมงานจะติดต่อกลับภายใน 2-3 วันทำการ",
          status: "success",
          duration: 6000,
          isClosable: true,
        });

        // Reset form and close modal
        setReportFormData({
          details: "",
          name: "",
          contact: "",
        });
        onReportClose();
      } else {
        throw new Error(response.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting case report:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <Box id="case-detail-root">
      {/* Dynamic SEO for this case study */}
      <SEOHead
        title={`${caseData.title} - เหมืองใกล้ฉัน 2025`}
        description={`${caseData.summary} - กรณีศึกษาผลกระทบจากเหมืองแร่ในปี ${caseData.year} พร้อมแผนที่โต้ตอบ ข้อมูลผลกระทบ และเสียงจากชุมชน`}
        keywords={`${caseData.tags.join(", ")}, เหมืองแร่, ผลกระทบสิ่งแวดล้อม, กรณีศึกษา, ปี ${caseData.year.toString()}`}
        image={`https://minenearme2025.vercel.app${caseData.heroImage}`}
        url={`https://minenearme2025.vercel.app/case/${caseData.id}`}
        type="article"
        publishedTime={`${caseData.year.toString()}-01-01T00:00:00Z`}
        section="กรณีศึกษา"
        tags={caseData.tags}
        author="MineNearMe Team"
      />

      {/* Hero Section */}
      <Box
        position="relative"
        h={["300px", "400px"]}
        bgImage={`url(${caseData.heroImage})`}
        bgPosition="center"
        bgSize="cover"
        bgRepeat="no-repeat"
        className="mining-pattern-hero"
      >
        {/* Dark overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.7)"
          zIndex={1}
        />

        <Container maxW="container.xl" h="100%" position="relative" zIndex={2}>
          <Flex
            direction="column"
            justify="center"
            align="flex-start"
            h="100%"
            color="white"
            p={4}
          >
            <Heading
              as="h1"
              size="2xl"
              mb={2}
              textShadow="2px 2px 4px rgba(0,0,0,0.8)"
            >
              {caseData.title}
            </Heading>
            <Text fontSize="xl" mb={6} textShadow="1px 1px 2px rgba(0,0,0,0.8)">
              ปี {caseData.year} | {caseData.tags.join(" • ")}
            </Text>
            <HStack>
              <Button
                leftIcon={<FaDownload />}
                colorScheme="orange"
                onClick={handleDownloadReport}
                boxShadow="0 4px 12px rgba(0,0,0,0.3)"
              >
                ดาวน์โหลดรายงาน
              </Button>
              <Button
                leftIcon={<FaShare />}
                colorScheme="orange"
                variant="outline"
                onClick={onShareOpen}
                bg="rgba(255,255,255,0.1)"
                borderColor="orange.300"
                color="white"
                _hover={{
                  bg: "rgba(255,255,255,0.2)",
                  borderColor: "orange.200",
                }}
                boxShadow="0 4px 12px rgba(0,0,0,0.3)"
              >
                แชร์กรณีนี้
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Interactive Map */}
      <Box bg={sectionBgColor} py={8}>
        <Container maxW="container.xl">
          <Heading as="h2" size="xl" mb={6}>
            แผนที่พื้นที่ภาพรวม
          </Heading>
          <Box
            position="relative"
            h="500px"
            borderRadius="lg"
            overflow="hidden"
          >
            <MapContainer
              center={[20.0, 100.05]}
              zoom={9}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <MapInitializer />
              <InitialMapView />

              <LayersControl position="topright">
                <LayersControl.BaseLayer name="แผนที่สว่าง">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="แผนที่มืด (ค่าเริ่มต้น)" checked>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="แผนที่ดาวเทียม">
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  />
                </LayersControl.BaseLayer>

                {/* Case 6 specific layers */}
                {caseData.id === "case-6" && (
                  <>
                    <LayersControl.Overlay
                      checked={case6Layers.kokRiver}
                      name="แม่น้ำกก"
                    >
                      <GeoJSONLayer
                        url={`${baseUrl}/assets/data/case6/case-6-kok-river.geojson`}
                        visible={case6Layers.kokRiver}
                        style={riverStyles.kok}
                        onEachFeature={onEachRiver}
                      />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay
                      checked={case6Layers.mekongRiver}
                      name="แม่น้ำโขง"
                    >
                      {(() => {
                        const fullUrl = `${baseUrl}/assets/data/case6/case-6-mekong-cliped.geojson`;
                        console.log("Mekong River URL:", fullUrl);

                        // Use MekongRiverRenderer component directly for better control
                        if (case6Layers.mekongRiver) {
                          return (
                            <React.Suspense fallback={null}>
                              <FetchGeoJSON
                                url={fullUrl}
                                render={(data) =>
                                  data ? (
                                    <MekongRiverRenderer
                                      data={data}
                                      visible={case6Layers.mekongRiver}
                                    />
                                  ) : null
                                }
                              />
                            </React.Suspense>
                          );
                        }
                        return null;
                      })()}
                    </LayersControl.Overlay>

                    <LayersControl.Overlay
                      checked={case6Layers.measaiRiver}
                      name="แม่น้ำแม่สาย"
                    >
                      <GeoJSONLayer
                        url={`${baseUrl}/assets/data/case6/case-6-measai-river.geojson`}
                        visible={case6Layers.measaiRiver}
                        style={{
                          ...riverStyles.measai,
                          weight: 5,
                          opacity: 1,
                        }}
                        onEachFeature={onEachRiver}
                      />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay
                      checked={case6Layers.ruakRiver}
                      name="แม่น้ำรวก"
                    >
                      <GeoJSONLayer
                        url={`${baseUrl}/assets/data/case6/case-6-ruak-river.geojson`}
                        visible={case6Layers.ruakRiver}
                        style={riverStyles.ruak}
                        onEachFeature={onEachRiver}
                      />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay
                      checked={case6Layers.kokMining}
                      name="เหมืองแม่น้ำกก"
                    >
                      <GeoJSONLayer
                        url={`${baseUrl}/assets/data/case6/case-6-kok-mining.geojson`}
                        visible={case6Layers.kokMining}
                        style={miningStyles.kok}
                        onEachFeature={onEachMining}
                      />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay
                      checked={case6Layers.saiMining}
                      name="เหมืองแม่น้ำสาย"
                    >
                      <GeoJSONLayer
                        url={`${baseUrl}/assets/data/case6/case-6-sai-mining.geojson`}
                        visible={case6Layers.saiMining}
                        style={miningStyles.sai}
                        onEachFeature={onEachMining}
                      />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay
                      checked={case6Layers.easternShanMining}
                      name="เหมืองฝั่งตะวันออกของรัฐฉาน"
                    >
                      <GeoJSONLayer
                        url={`${baseUrl}/assets/data/case6/case-6-eastern-shan-mining.geojson`}
                        visible={case6Layers.easternShanMining}
                        style={miningStyles.easternShan}
                        onEachFeature={onEachMining}
                      />
                    </LayersControl.Overlay>

                    {/* Nearby Villages */}
                    <LayersControl.Overlay
                      checked={case6Layers.nearbyVillages}
                      name="หมู่บ้านใกล้เคียง (5 กม.)"
                    >
                      <NearbyVillageLayer
                        url={`${baseUrl}/assets/data/case6/case-6-village-5km-near.geojson`}
                        visible={case6Layers.nearbyVillages}
                      />
                    </LayersControl.Overlay>

                    {/* KokWatch Monitoring Points */}
                    <LayersControl.Overlay
                      checked={case6Layers.kokWatchMonitoring}
                      name="จุดที่ได้รับการตรวจน้ำ"
                    >
                      <KokWatchMonitoringLayer
                        visible={case6Layers.kokWatchMonitoring}
                      />
                    </LayersControl.Overlay>
                  </>
                )}

                {/* Remove the separate conditional render for villages */}
              </LayersControl>

              {activeMapLayers.miningArea && caseData.polygonGeoJSON && (
                <>
                  <CustomPolygonRenderer data={caseData.polygonGeoJSON} />
                </>
              )}

              {activeMapLayers.villages &&
                caseData.villagesGeoJSON &&
                caseData.villagesGeoJSON.features?.map(
                  (village) =>
                    village.properties && (
                      <Marker
                        key={village.properties.name}
                        position={[
                          village.geometry.coordinates[1],
                          village.geometry.coordinates[0],
                        ]}
                        icon={createVillageIcon(
                          village.properties.impact_level
                        )}
                      >
                        <Popup>
                          <Box p={1}>
                            <Text fontWeight="bold">
                              {village.properties.name}
                            </Text>
                            <Text fontSize="sm">
                              ประชากร: {village.properties.population} คน
                            </Text>
                            <Text fontSize="sm">
                              ระดับผลกระทบ:{" "}
                              {village.properties.impact_level === "high"
                                ? "สูง"
                                : village.properties.impact_level === "medium"
                                  ? "ปานกลาง"
                                  : "ต่ำ"}
                            </Text>
                          </Box>
                        </Popup>
                      </Marker>
                    )
                )}
            </MapContainer>

            {/* Map Legend */}
            <Box
              position="absolute"
              top={4}
              left={4}
              bg={useColorModeValue("white", "gray.800")}
              borderRadius="md"
              boxShadow="md"
              zIndex={1000}
              maxWidth="200px"
              fontSize="sm"
              // Make legend responsive
              width={{ base: isLegendVisible ? "200px" : "auto", md: "200px" }}
              transition="all 0.3s ease"
            >
              {/* Legend toggle button for mobile */}
              <Flex
                justify="space-between"
                align="center"
                p={3}
                display={{
                  base: "flex",
                  md: isLegendVisible ? "flex" : "none",
                }}
              >
                <Text fontWeight="bold" fontSize="sm">
                  {isLegendVisible ? "ชั้นข้อมูล" : "แผนที่"}
                </Text>
                <IconButton
                  aria-label={isLegendVisible ? "ซ่อนคำอธิบาย" : "แสดงคำอธิบาย"}
                  icon={
                    isLegendVisible ? (
                      <Box as="span">✕</Box>
                    ) : (
                      <Box as="span">🗂</Box>
                    )
                  }
                  size="xs"
                  variant="ghost"
                  onClick={() => setIsLegendVisible(!isLegendVisible)}
                  display={{ base: "flex", md: "none" }}
                  ml={2}
                />
              </Flex>

              {/* Legend content - always visible on desktop, toggleable on mobile */}
              <Box
                display={{
                  base: isLegendVisible ? "block" : "none",
                  md: "block",
                }}
                p={{ base: isLegendVisible ? 3 : 0, md: 3 }}
                pt={{ base: isLegendVisible ? 0 : 0, md: 3 }}
              >
                <VStack align="start" spacing={2} width="100%">
                  {/* Only show general layers for non-case-6 cases */}
                  {caseData.id !== "case-6" && (
                    <>
                      <HStack>
                        <Box
                          w={4}
                          h={4}
                          bg={
                            activeMapLayers.miningArea ? "#E53E3E" : "gray.300"
                          }
                          opacity={0.4}
                          border="1px solid"
                          borderColor={
                            activeMapLayers.miningArea ? "#C53030" : "gray.400"
                          }
                          cursor="pointer"
                          onClick={() => toggleMapLayer("miningArea")}
                        />
                        <Text fontSize="sm">พื้นที่เหมือง</Text>
                      </HStack>
                      <HStack>
                        <Box
                          w={4}
                          h={4}
                          bg={activeMapLayers.villages ? "white" : "gray.300"}
                          border="1px solid"
                          borderColor={
                            activeMapLayers.villages ? "gray.500" : "gray.400"
                          }
                          borderRadius="full"
                          cursor="pointer"
                          onClick={() => toggleMapLayer("villages")}
                          position="relative"
                          _before={{
                            content: '""',
                            position: "absolute",
                            top: "25%",
                            left: "25%",
                            width: "50%",
                            height: "50%",
                            borderRadius: "full",
                            bg: activeMapLayers.villages
                              ? "#4299E1"
                              : "gray.300",
                          }}
                        />
                        <Text fontSize="sm">หมู่บ้าน</Text>
                      </HStack>
                    </>
                  )}

                  {/* Case 6 specific layers */}
                  {caseData.id === "case-6" && (
                    <>
                      <Divider my={2} />
                      <Text fontWeight="bold" mb={2} fontSize="sm">
                        ชั้นข้อมูลเฉพาะกรณีศึกษา
                      </Text>

                      {/* Rivers */}
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" fontWeight="bold">
                          แม่น้ำ:
                        </Text>
                        <HStack>
                          <Box
                            w={4}
                            h={1}
                            bg={
                              case6Layers.kokRiver
                                ? riverStyles.kok.color
                                : "gray.300"
                            }
                            cursor="pointer"
                            onClick={() => toggleCase6Layer("kokRiver")}
                          />
                          <Text fontSize="xs">แม่น้ำกก</Text>
                        </HStack>
                        <HStack>
                          <Box
                            w={4}
                            h={1}
                            bg={
                              case6Layers.mekongRiver
                                ? "#2054E5" // Match our new mekong color
                                : "gray.300"
                            }
                            cursor="pointer"
                            onClick={() => toggleCase6Layer("mekongRiver")}
                          />
                          <Text fontSize="xs">แม่น้ำโขง</Text>
                        </HStack>
                        <HStack>
                          <Box
                            w={4}
                            h={1}
                            bg={
                              case6Layers.measaiRiver
                                ? riverStyles.measai.color
                                : "gray.300"
                            }
                            cursor="pointer"
                            onClick={() => toggleCase6Layer("measaiRiver")}
                          />
                          <Text fontSize="xs">แม่น้ำแม่สาย</Text>
                        </HStack>
                        <HStack>
                          <Box
                            w={4}
                            h={1}
                            bg={
                              case6Layers.ruakRiver
                                ? riverStyles.ruak.color
                                : "gray.300"
                            }
                            cursor="pointer"
                            onClick={() => toggleCase6Layer("ruakRiver")}
                          />
                          <Text fontSize="xs">แม่น้ำรวก</Text>
                        </HStack>
                      </VStack>

                      {/* Mining areas */}
                      <VStack align="start" spacing={1} mt={2}>
                        <Text fontSize="xs" fontWeight="bold">
                          พื้นที่เหมือง:
                        </Text>
                        <HStack>
                          <Box
                            w={4}
                            h={4}
                            bg={
                              case6Layers.kokMining ||
                              case6Layers.saiMining ||
                              case6Layers.easternShanMining
                                ? "#FF0000"
                                : "gray.300"
                            }
                            opacity={0.4}
                            border="1px solid"
                            borderColor={
                              case6Layers.kokMining ||
                              case6Layers.saiMining ||
                              case6Layers.easternShanMining
                                ? "#880000"
                                : "gray.400"
                            }
                            cursor="pointer"
                            onClick={() => {
                              const allMiningOn =
                                case6Layers.kokMining &&
                                case6Layers.saiMining &&
                                case6Layers.easternShanMining;
                              setCase6Layers((prev) => ({
                                ...prev,
                                kokMining: !allMiningOn,
                                saiMining: !allMiningOn,
                                easternShanMining: !allMiningOn,
                              }));
                            }}
                          />
                          <Text fontSize="xs">พื้นที่เหมือง</Text>
                        </HStack>
                      </VStack>

                      {/* Nearby Villages */}
                      <VStack align="start" spacing={1} mt={2}>
                        <Text fontSize="xs" fontWeight="bold">
                          หมู่บ้าน:
                        </Text>
                        <HStack>
                          <Box
                            w={4}
                            h={4}
                            bg={
                              case6Layers.nearbyVillages ? "white" : "gray.300"
                            }
                            border="1px solid"
                            borderColor={
                              case6Layers.nearbyVillages
                                ? "gray.500"
                                : "gray.400"
                            }
                            borderRadius="full"
                            cursor="pointer"
                            onClick={() => toggleCase6Layer("nearbyVillages")}
                            position="relative"
                            _before={{
                              content: '""',
                              position: "absolute",
                              top: "25%",
                              left: "25%",
                              width: "50%",
                              height: "50%",
                              borderRadius: "full",
                              bg: case6Layers.nearbyVillages
                                ? "#4299E1"
                                : "gray.300",
                            }}
                          />
                          <Text fontSize="xs">หมู่บ้านใกล้เคียง (5 กม.)</Text>
                        </HStack>
                      </VStack>

                      {/* Contamination Monitoring */}
                      <VStack align="start" spacing={1} mt={2}>
                        <Text fontSize="xs" fontWeight="bold">
                          จุดตรวจสอบมลพิษ:
                        </Text>
                        <HStack>
                          <Box
                            w={4}
                            h={4}
                            bg={
                              case6Layers.kokWatchMonitoring
                                ? "#48BB78"
                                : "gray.300"
                            }
                            border="1px solid"
                            borderColor={
                              case6Layers.kokWatchMonitoring
                                ? "green.600"
                                : "gray.400"
                            }
                            borderRadius="full"
                            cursor="pointer"
                            onClick={() =>
                              toggleCase6Layer("kokWatchMonitoring")
                            }
                            position="relative"
                            _before={{
                              content: '""',
                              position: "absolute",
                              top: "3px",
                              left: "3px",
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              bg: "white",
                            }}
                          />
                          <Text fontSize="xs">จุดที่ได้รับการตรวจน้ำ</Text>
                        </HStack>
                      </VStack>
                    </>
                  )}
                </VStack>
                <Divider my={2} />
              </Box>
            </Box>

            {/* Map Data Disclaimer */}
            <Box
              mt={2}
              px={3}
              py={2}
              fontSize="xs"
              color="gray.500"
              bg="gray.50"
              borderRadius="md"
              borderLeft="3px solid"
              borderColor="gray.300"
            >
              <Text fontWeight="medium" mb={1} fontSize="sm" color="gray.600">
                ข้อจำกัดของข้อมูล:
              </Text>
              <Text>
                ข้อมูลที่แสดงบนแผนที่นี้รวบรวมจากการระบุของ PI,SHRF,และMEITI
                ข้อมูลนี้มีวัตถุประสงค์เพื่อการศึกษาและไม่ควรนำไปใช้เพื่อการดำเนินการทางกฎหมายโดยตรง
                ข้อมูลอัปเดตล่าสุด: พ.ค. 2566
              </Text>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Timeline Story */}
      <Container maxW="container.xl" py={8}>
        <Heading as="h2" size="xl" mb={6}>
          ลำดับเหตุการณ์
        </Heading>
        <TimelineCarousel
          events={caseData.timelineEvents || []}
          onEventSelect={(event, index) => {
            // Here you can add map highlighting when an event is selected
            console.log("Event selected:", event, "at index:", index);
          }}
        />
      </Container>

      {/* Issue & Impact */}
      <Box bg={sectionBgColor} py={8} className="mining-pattern-medium">
        <Container maxW="container.xl">
          <Heading as="h2" size="xl" mb={6}>
            ปัญหาและผลกระทบ
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <Card bg={cardBgColor} className="mining-pattern-card">
              <CardHeader>
                <Heading size="md">ปัญหา</Heading>
              </CardHeader>
              <CardBody>
                <Text>{caseData.content}</Text>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} className="mining-pattern-card">
              <CardHeader>
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading size="md">ประเมินผลกระทบเบื้องต้น</Heading>
                  <Tooltip
                    label="ข้อมูลเพิ่มเติมเกี่ยวกับการประเมินผลกระทบ"
                    hasArrow
                  >
                    <IconButton
                      aria-label="ข้อมูลเพิ่มเติม"
                      icon={<FaInfoCircle />}
                      variant="ghost"
                      size="sm"
                      colorScheme="blue"
                      onClick={onImpactInfoOpen}
                    />
                  </Tooltip>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Box color="orange.500">
                      <FaHome size={20} />
                    </Box>
                    <Text fontWeight="bold">หมู่บ้านที่อาจะได้รับผลกระทบ:</Text>
                    <Text>{caseData.impactStats?.villages || 0} หมู่บ้าน</Text>
                  </HStack>

                  <HStack>
                    <Box color="blue.500">
                      <FaUsers size={20} />
                    </Box>
                    <Text fontWeight="bold">
                      จำนวนประชาชนที่อยู่ในพื้นท่ี 5 กิโล:
                    </Text>
                    <Text>
                      {(caseData.impactStats?.people || 0).toLocaleString()} คน
                    </Text>
                  </HStack>

                  <Box w="100%">
                    <HStack mb={2}>
                      <Box color="red.500">
                        <FaChartLine size={20} />
                      </Box>
                      <Text fontWeight="bold">ดัชนีมลพิษรายเดือน:</Text>
                    </HStack>

                    {/* Hide entire pollution monitoring section for case-6 since it has real-time KokWatch data on the map */}
                    {id !== "case-6" && (
                      <Box w="100%">
                        <HStack mb={2}>
                          <Box color="red.500">
                            <FaChartLine size={20} />
                          </Box>
                          <Text fontWeight="bold">ดัชนีมลพิษรายเดือน:</Text>
                        </HStack>

                        {/* Simple Sparkline */}
                        <Box position="relative" h="60px" p={2}>
                          <Flex
                            h="40px"
                            w="100%"
                            align="flex-end"
                            justify="space-between"
                          >
                            {(caseData.impactStats?.pollutionLevels || []).map(
                              (level, i) => (
                                <Box
                                  key={i}
                                  h={`${(level / 25) * 100}%`}
                                  w="8%"
                                  bg={
                                    level > 20
                                      ? "red.500"
                                      : level > 15
                                        ? "orange.400"
                                        : "green.400"
                                  }
                                  borderRadius="sm"
                                />
                              )
                            )}
                          </Flex>
                          <Flex justify="space-between" mt={1}>
                            <Text fontSize="xs">ม.ค.</Text>
                            <Text fontSize="xs">ก.พ.</Text>
                            <Text fontSize="xs">มี.ค.</Text>
                            <Text fontSize="xs">เม.ย.</Text>
                            <Text fontSize="xs">พ.ค.</Text>
                            <Text fontSize="xs">มิ.ย.</Text>
                          </Flex>
                        </Box>

                        <HStack
                          justify="space-between"
                          fontSize="xs"
                          color="gray.500"
                          mt={1}
                        >
                          <HStack>
                            <Box w={2} h={2} bg="green.400" />
                            <Text>ต่ำ</Text>
                          </HStack>
                          <HStack>
                            <Box w={2} h={2} bg="orange.400" />
                            <Text>ปานกลาง</Text>
                          </HStack>
                          <HStack>
                            <Box w={2} h={2} bg="red.500" />
                            <Text>สูง</Text>
                          </HStack>
                        </HStack>
                      </Box>
                    )}

                    {/* For case-6, show a note about real-time monitoring data */}
                    {id === "case-6" && (
                      <Box
                        p={4}
                        bg="blue.50"
                        borderRadius="md"
                        borderLeft="4px solid"
                        borderColor="blue.400"
                      >
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="blue.700"
                          mb={2}
                        >
                          📊 ข้อมูลการตรวจวัดจริง
                        </Text>
                        <Text fontSize="sm" color="blue.600">
                          สำหรับกรณีศึกษานี้
                          สามารถดูข้อมูลการตรวจวัดคุณภาพน้ำแบบเรียลไทม์ได้จากจุดตรวจวัดต่างๆ
                          ในแผนที่ด้านบน (เปิดชั้นข้อมูล
                          &ldquo;จุดที่ได้รับการตรวจน้ำ&rdquo;)
                        </Text>
                      </Box>
                    )}
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </Grid>
        </Container>
      </Box>

      {/* Community Voices */}
      <Container maxW="container.xl" py={8} className="mining-pattern-subtle">
        <Heading as="h2" size="xl" mb={6}>
          เสียงจากชุมชน
        </Heading>
        <Grid
          templateColumns={{
            base: "1fr",
            md: "1fr 1fr",
            lg: "1fr 1fr 1fr",
          }}
          gap={6}
        >
          {(caseData.voices || []).map((voice, index) => (
            <Card key={index} bg={cardBgColor} className="mining-pattern-card">
              <CardBody>
                <HStack mb={4}>
                  <Avatar src={voice.avatar} name={voice.name} size="md" />
                  <Box>
                    <Text fontWeight="bold">{voice.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {voice.role}
                    </Text>
                  </Box>
                </HStack>
                <Text noOfLines={4} mb={3}>
                  &ldquo;{voice.text}&rdquo;
                </Text>
                {voice.urlsource ? (
                  <Tooltip
                    label="ลิงก์นี้จะเปิดในแท็บใหม่"
                    placement="top"
                    hasArrow
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVoiceClick(voice)}
                      rightIcon={<FaExternalLinkAlt size="12px" />}
                    >
                      อ่านเพิ่มเติมที่ต้นฉบับ
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVoiceClick(voice)}
                  >
                    อ่านเต็มบทสัมภาษณ์
                  </Button>
                )}
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Container>

      {/* Resources & Downloads */}
      <Box bg={sectionBgColor} py={8} className="mining-pattern-medium">
        <Container maxW="container.xl">
          <Heading as="h2" size="xl" mb={6}>
            ข้อมูลและเอกสาร
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {(caseData.resources || []).map((resource, index) => (
              <Card
                key={index}
                bg={cardBgColor}
                className="mining-pattern-card"
              >
                <CardBody>
                  <Flex direction="column" h="100%">
                    <HStack mb={3}>
                      <Box
                        as={getResourceIcon(resource.type)}
                        color="blue.500"
                      />
                      <Badge
                        colorScheme={
                          resource.type === "PDF"
                            ? "red"
                            : resource.type === "Excel"
                              ? "green"
                              : "blue"
                        }
                      >
                        {resource.type}
                      </Badge>
                    </HStack>
                    <Text fontWeight="bold" flex="1" mb={4}>
                      {resource.label}
                    </Text>
                    <Link
                      href={resource.url}
                      isExternal
                      color="blue.500"
                      display="flex"
                      alignItems="center"
                    >
                      <FaDownload style={{ marginRight: "0.5rem" }} />
                      ดาวน์โหลด
                    </Link>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Call to Action & Feedback */}
      <Container maxW="container.xl" py={8} className="mining-pattern-subtle">
        <VStack spacing={8}>
          <Box w="100%" className="mining-pattern-card" p={6} borderRadius="md">
            <Heading as="h2" size="xl" mb={6}>
              มีส่วนร่วมพื้นที่นี้
            </Heading>
            <Button
              colorScheme="orange"
              variant="outline"
              size="lg"
              onClick={onReportOpen}
            >
              แจ้งเรื่องเพิ่มเติม
            </Button>
          </Box>

          <Divider />

          <Box w="100%" className="mining-pattern-card" p={6} borderRadius="md">
            <Heading as="h3" size="lg" mb={4}>
              ส่งความคิดเห็น
            </Heading>
            {showFeedbackSuccess && (
              <Alert status="success" mb={4}>
                <AlertIcon />
                ขอบคุณสำหรับความคิดเห็นของคุณ
              </Alert>
            )}
            <form onSubmit={handleFeedbackSubmit}>
              <Textarea
                placeholder="แสดงความคิดเห็นเกี่ยวกับกรณีนี้..."
                mb={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                required
              />
              <Button
                type="submit"
                colorScheme="orange"
                isDisabled={!feedbackText.trim()}
              >
                ส่งความคิดเห็น
              </Button>
            </form>

            {/* Comments Section */}
            <Box mt={8}>
              <Heading as="h4" size="md" mb={4}>
                ความคิดเห็นจากผู้อ่าน ({commentStats.totalComments} ความคิดเห็น)
              </Heading>

              {commentsError && (
                <Alert status="error" mb={4}>
                  <AlertIcon />
                  {commentsError}
                </Alert>
              )}

              {commentsLoading ? (
                <Box textAlign="center" py={8} className="loading-with-pattern">
                  <Spinner size="lg" color="orange.500" />
                  <Text mt={2} color="gray.500">
                    กำลังโหลดความคิดเห็น...
                  </Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {comments.map((comment) => (
                    <Card
                      key={comment._id}
                      bg={cardBgColor}
                      variant="outline"
                      className="mining-pattern-card"
                    >
                      <CardBody>
                        <HStack mb={3} justify="space-between">
                          <HStack>
                            <Avatar
                              src={comment.avatar}
                              name={comment.author}
                              size="sm"
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" fontSize="sm">
                                {comment.author}
                              </Text>
                              <HStack
                                spacing={1}
                                color="gray.500"
                                fontSize="xs"
                              >
                                <FaClock />
                                <Text>{comment.age}</Text>
                              </HStack>
                            </VStack>
                          </HStack>
                        </HStack>

                        <Text mb={3} fontSize="sm">
                          {comment.text}
                        </Text>

                        <HStack spacing={4}>
                          <Button
                            size="xs"
                            variant="ghost"
                            leftIcon={<FaThumbsUp />}
                            onClick={() => handleLikeComment(comment._id)}
                            color="gray.600"
                            _hover={{ color: "blue.500" }}
                          >
                            {comment.likes > 0 && comment.likes}
                          </Button>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}

                  {comments.length === 0 && !commentsLoading && (
                    <Box
                      textAlign="center"
                      py={8}
                      color="gray.500"
                      className="empty-state-pattern"
                    >
                      <Text>
                        ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็น!
                      </Text>
                    </Box>
                  )}
                </VStack>
              )}
            </Box>
          </Box>
        </VStack>

        {/* Report Modal */}
        <Modal isOpen={isReportOpen} onClose={onReportClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>แจ้งข้อมูลเพิ่มเติมเกี่ยวกับกรณีนี้</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleReportSubmit}>
              <ModalBody>
                <VStack spacing={4} align="start">
                  <Text>
                    หากคุณมีข้อมูลเพิ่มเติมเกี่ยวกับกรณีนี้
                    กรุณากรอกรายละเอียดด้านล่าง
                    ทีมงานของเราจะติดต่อกลับเพื่อขอข้อมูลเพิ่มเติม
                  </Text>

                  <Textarea
                    placeholder="รายละเอียดเหตุการณ์หรือข้อมูลเพิ่มเติม..."
                    h="150px"
                    value={reportFormData.details}
                    onChange={(e) => {
                      console.log("Details onChange:", e.target.value);
                      setReportFormData({
                        ...reportFormData,
                        details: e.target.value,
                      });
                    }}
                    required
                  />

                  <HStack w="100%">
                    <Box flex="1">
                      <Text mb={1}>ชื่อ (ไม่บังคับ)</Text>
                      <Input
                        placeholder="ชื่อ-นามสกุล"
                        size="sm"
                        value={reportFormData.name}
                        onChange={(e) =>
                          setReportFormData({
                            ...reportFormData,
                            name: e.target.value,
                          })
                        }
                      />
                    </Box>
                    <Box flex="1">
                      <Text mb={1}>ช่องทางติดต่อ (ไม่บังคับ)</Text>
                      <Input
                        placeholder="อีเมลหรือเบอร์โทรศัพท์"
                        size="sm"
                        value={reportFormData.contact}
                        onChange={(e) =>
                          setReportFormData({
                            ...reportFormData,
                            contact: e.target.value,
                          })
                        }
                      />
                    </Box>
                  </HStack>

                  <Box
                    w="100%"
                    borderRadius="md"
                    p={4}
                    bg="orange.50"
                    color="orange.800"
                  >
                    <HStack>
                      <Box color="orange.500">
                        <FaExclamationTriangle />
                      </Box>
                      <Text fontWeight="bold">หมายเหตุ:</Text>
                    </HStack>
                    <Text fontSize="sm" mt={2}>
                      ข้อมูลส่วนตัวของคุณจะถูกเก็บเป็นความลับ
                      และใช้สำหรับการติดต่อกลับเท่านั้น
                      เราจะไม่เปิดเผยข้อมูลของคุณโดยไม่ได้รับอนุญาต
                    </Text>
                  </Box>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onReportClose}>
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  colorScheme="orange"
                  isLoading={isSubmittingReport}
                  loadingText="กำลังส่งข้อมูล..."
                >
                  ส่งข้อมูล
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Impact Assessment Info Modal */}
        <Modal isOpen={isImpactInfoOpen} onClose={onImpactInfoClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>ข้อมูลเกี่ยวกับการประเมินผลกระทบ</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6} align="start">
                <Box>
                  <Heading size="sm" mb={2}>
                    วิธีการประเมิน
                  </Heading>
                  <Text>
                    {caseData.impactAssessmentInfo?.methodology ||
                      "การประเมินผลกระทบเบื้องต้นนี้ใช้ข้อมูลจากการสำรวจพื้นที่ การเก็บตัวอย่างน้ำและดิน และการสัมภาษณ์ชาวบ้านในพื้นที่ ข้อมูลที่แสดงเป็นการประมาณการจากข้อมูลที่มีอยู่ และอาจมีการเปลี่ยนแปลงได้ตามการสำรวจและการเก็บข้อมูลเพิ่มเติม"}
                  </Text>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>
                    ข้อจำกัดของข้อมูล
                  </Heading>
                  <Text>
                    {caseData.impactAssessmentInfo?.disclaimer ||
                      "ข้อมูลนี้เป็นเพียงการประเมินเบื้องต้น ไม่ใช่การศึกษาผลกระทบด้านสิ่งแวดล้อมอย่างเป็นทางการ และไม่สามารถใช้แทนการศึกษาผลกระทบสิ่งแวดล้อม (EIA) หรือการศึกษาด้านสุขภาพ (HIA) ได้"}
                  </Text>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>
                    หน่วยงานที่ทำการประเมิน
                  </Heading>
                  <Text>
                    {caseData.impactAssessmentInfo?.assessmentOrganization ||
                      "การประเมินนี้ดำเนินการโดยคณะทำงานเครือข่ายติดตามผลกระทบเหมืองแร่ ร่วมกับนักวิชาการจากมหาวิทยาลัยในพื้นที่ และได้รับการสนับสนุนข้อมูลจากหน่วยงานท้องถิ่น"}
                  </Text>
                </Box>

                <Box
                  w="100%"
                  borderRadius="md"
                  p={4}
                  bg="yellow.50"
                  color="yellow.800"
                >
                  <HStack mb={2}>
                    <Box color="yellow.500">
                      <FaExclamationTriangle />
                    </Box>
                    <Text fontWeight="bold">ข้อควรระวัง:</Text>
                  </HStack>
                  <Text fontSize="sm">
                    ข้อมูลนี้อาจมีความคลาดเคลื่อนและควรใช้ประกอบกับข้อมูลจากหน่วยงานที่มีหน้าที่ความรับผิดชอบโดยตรง
                    หากต้องการข้อมูลเพื่อประกอบการตัดสินใจเชิงนโยบายหรือการดำเนินการทางกฎหมาย
                    กรุณาติดต่อหน่วยงานที่เกี่ยวข้องโดยตรง
                  </Text>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={onImpactInfoClose}>
                ปิด
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Social Share Modal */}
        <Modal isOpen={isShareOpen} onClose={onShareClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>แชร์กรณีศึกษานี้</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Text textAlign="center" color="gray.600" mb={2}>
                  เลือกแพลตฟอร์มที่ต้องการแชร์
                </Text>

                <SimpleGrid columns={3} spacing={4} w="100%">
                  <Button
                    leftIcon={<FaFacebookF />}
                    colorScheme="facebook"
                    onClick={() => handleSocialShare("facebook")}
                    size="md"
                    justifyContent="flex-start"
                  >
                    Facebook
                  </Button>

                  <Button
                    leftIcon={<FaXTwitter />}
                    colorScheme="gray"
                    onClick={() => handleSocialShare("twitter")}
                    size="md"
                    justifyContent="flex-start"
                    color="white"
                    _hover={{ bg: "gray.800" }}
                  >
                    X
                  </Button>

                  <Button
                    leftIcon={<FaLine />}
                    colorScheme="green"
                    onClick={() => handleSocialShare("line")}
                    size="md"
                    justifyContent="flex-start"
                  >
                    LINE
                  </Button>
                </SimpleGrid>

                <Divider />

                <VStack spacing={3} w="100%">
                  {navigator.share && (
                    <Button
                      leftIcon={<FaShare />}
                      variant="outline"
                      onClick={() => handleSocialShare("native")}
                      size="lg"
                      w="100%"
                      justifyContent="flex-start"
                    >
                      แชร์ด้วยแอปอื่นๆ
                    </Button>
                  )}

                  <Button
                    leftIcon={<FaCopy />}
                    variant="outline"
                    onClick={() => handleSocialShare("copy")}
                    size="lg"
                    w="100%"
                    justifyContent="flex-start"
                  >
                    คัดลอกลิงก์
                  </Button>
                </VStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onShareClose}>
                ปิด
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>

      {/* Interview Modal */}
      <Modal isOpen={isInterviewOpen} onClose={onInterviewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Avatar
                src={selectedVoice?.avatar}
                name={selectedVoice?.name}
                size="sm"
              />
              <Box>
                <Text>{selectedVoice?.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {selectedVoice?.role}
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="md" fontStyle="italic" mb={4}>
              &ldquo;{selectedVoice?.text}&rdquo;
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="orange" onClick={onInterviewClose}>
              ปิด
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CaseDetail;
