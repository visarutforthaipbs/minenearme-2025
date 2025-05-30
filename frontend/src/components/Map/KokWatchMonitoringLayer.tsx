import React, { useState, useEffect } from "react";
import { Marker, Popup, LayerGroup } from "react-leaflet";
import L from "leaflet";
import { Box, Text, VStack, HStack, Badge } from "@chakra-ui/react";
import type {
  KokWatchAPIResponse,
  KokWatchPCDPoint,
  KokWatchMaeFahLuangPoint,
} from "../../types/kokWatch";
import { parseArsenicValue, getContaminationLevel } from "../../types/kokWatch";

interface KokWatchMonitoringLayerProps {
  visible: boolean;
}

// Add custom CSS for the popup styling
const popupStyles = `
  @font-face {
    font-family: 'DBHelveThaiCAX';
    src: url('/assets/font/dbhelvethaicax-webfont.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
  }

  .kok-watch-popup .leaflet-popup-content-wrapper {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border: 1px solid #e2e8f0;
    padding: 0;
    font-family: 'DBHelveThaiCAX', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }
  
  .kok-watch-popup .leaflet-popup-content {
    margin: 0;
    padding: 0;
    border-radius: 8px;
    overflow: hidden;
    font-family: inherit;
  }
  
  .kok-watch-popup .leaflet-popup-tip {
    background: white;
    border: 1px solid #e2e8f0;
    border-top: none;
    border-right: none;
  }
  
  .kok-watch-popup .leaflet-popup-close-button {
    color: #718096;
    font-size: 18px;
    padding: 8px;
    top: 8px;
    right: 8px;
  }
  
  .kok-watch-popup .leaflet-popup-close-button:hover {
    background: #f7fafc;
    border-radius: 4px;
  }
  
  .kok-watch-popup * {
    font-family: 'DBHelveThaiCAX', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif !important;
  }
`;

// Inject styles into document head
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = popupStyles;
  document.head.appendChild(styleElement);
}

// Create custom icon based on contamination level
const createContaminationIcon = (
  level: "safe" | "warning" | "danger" | "critical"
) => {
  const { color } = getContaminationLevel(
    level === "safe"
      ? 0.005
      : level === "warning"
        ? 0.015
        : level === "danger"
          ? 0.03
          : 0.1
  );

  console.log(`Creating icon for level: ${level}, color: ${color}`);

  return L.divIcon({
    className: "contamination-marker",
    html: `
      <div style="
        background-color: ${color}; 
        width: 16px; 
        height: 16px; 
        border-radius: 50%; 
        border: 2px solid white; 
        box-shadow: 0 0 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          background-color: white;
          width: 6px;
          height: 6px;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Create popup content for PCD monitoring point
const createPCDPopupContent = (point: KokWatchPCDPoint) => {
  const latestSurfaceWater =
    point.surface_water[point.surface_water.length - 1];

  // Get arsenic level for contamination assessment
  const arsenicValue = latestSurfaceWater
    ? parseArsenicValue(latestSurfaceWater.AS)
    : 0;
  const contamination = getContaminationLevel(arsenicValue);

  return (
    <Box p={2} maxWidth="220px" bg="white" borderRadius="md" boxShadow="sm">
      <VStack align="start" spacing={2}>
        <Box>
          <Text fontWeight="bold" fontSize="sm" color="blue.700">
            🏛️ {point.name}
          </Text>
          <Text fontSize="xs" color="gray.600">
            📍 {point.area}
          </Text>
        </Box>

        <Badge
          size="sm"
          px={2}
          py={1}
          borderRadius="full"
          colorScheme={
            contamination.level === "safe"
              ? "green"
              : contamination.level === "warning"
                ? "orange"
                : "red"
          }
          variant="subtle"
          fontSize="xs"
          fontWeight="bold"
        >
          {contamination.label}
        </Badge>

        {latestSurfaceWater && (
          <Box width="100%">
            <HStack justify="space-between" width="100%">
              <Text fontSize="xs" fontWeight="medium">
                สารหนู (As):
              </Text>
              <Text
                fontSize="xs"
                fontWeight="bold"
                color={arsenicValue > 0.01 ? "red.600" : "green.600"}
                px={2}
                py={1}
                bg={arsenicValue > 0.01 ? "red.50" : "green.50"}
                borderRadius="md"
              >
                {latestSurfaceWater.AS} mg/L
              </Text>
            </HStack>
            <Text fontSize="xs" color="gray.500" mt={1}>
              📅 {latestSurfaceWater.saveDate}
            </Text>
          </Box>
        )}

        <Box
          fontSize="xs"
          color="gray.600"
          bg="gray.50"
          p={1}
          borderRadius="md"
          width="100%"
        >
          <Text fontWeight="bold">⚠️ มาตรฐาน: ≤ 0.01 mg/L</Text>
        </Box>
      </VStack>
    </Box>
  );
};

// Create popup content for Mae Fah Luang monitoring point
const createMaeFahLuangPopupContent = (point: KokWatchMaeFahLuangPoint) => {
  const latestData = point.data[point.data.length - 1];
  const arsenicValue = latestData ? parseArsenicValue(latestData.AS) : 0;
  const contamination = getContaminationLevel(arsenicValue);

  return (
    <Box p={2} maxWidth="220px" bg="white" borderRadius="md" boxShadow="sm">
      <VStack align="start" spacing={2}>
        <Box>
          <Text fontWeight="bold" fontSize="sm" color="green.700">
            🌿 {point.name}
          </Text>
          <Text fontSize="xs" color="gray.600">
            📍 {point.area}
          </Text>
        </Box>

        <Badge
          size="sm"
          px={2}
          py={1}
          borderRadius="full"
          colorScheme={
            contamination.level === "safe"
              ? "green"
              : contamination.level === "warning"
                ? "orange"
                : "red"
          }
          variant="subtle"
          fontSize="xs"
          fontWeight="bold"
        >
          {contamination.label}
        </Badge>

        {latestData && (
          <Box width="100%">
            <HStack justify="space-between" width="100%">
              <Text fontSize="xs" fontWeight="medium">
                สารหนู (As):
              </Text>
              <Text
                fontSize="xs"
                fontWeight="bold"
                color={arsenicValue > 0.01 ? "red.600" : "green.600"}
                px={2}
                py={1}
                bg={arsenicValue > 0.01 ? "red.50" : "green.100"}
                borderRadius="md"
              >
                {latestData.AS === "ไม่พบสารหนูเกินค่ามาตรฐาน"
                  ? "ไม่เกินมาตรฐาน"
                  : `${latestData.AS} mg/L`}
              </Text>
            </HStack>
            <Text fontSize="xs" color="gray.500" mt={1}>
              📅 {latestData.saveDate}
            </Text>
          </Box>
        )}

        <Box
          fontSize="xs"
          color="gray.600"
          bg="gray.50"
          p={1}
          borderRadius="md"
          width="100%"
        >
          <Text fontWeight="bold">⚠️ มาตรฐาน: ≤ 0.01 mg/L</Text>
          <Text fontSize="xs" color="gray.500">
            มูลนิธิแม่ฟ้าหลวง
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

const KokWatchMonitoringLayer: React.FC<KokWatchMonitoringLayerProps> = ({
  visible,
}) => {
  const [data, setData] = useState<KokWatchAPIResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "/api/kokwatch?token=0265026b95a4a0618f9a300776c823e3"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: KokWatchAPIResponse = await response.json();

        if (result.status === "success") {
          setData(result);
          console.log("KokWatch data loaded:", {
            pcd_points: result.data.pcd_data.length,
            maefahluang_points: result.data.maefahluang_data.length,
          });
        } else {
          throw new Error("API returned error status");
        }
      } catch (err) {
        console.error("Error fetching KokWatch data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [visible]);

  if (!visible || loading || error || !data) {
    return null;
  }

  console.log("Rendering KokWatch markers, visible:", visible);

  return (
    <LayerGroup>
      {/* PCD Monitoring Points */}
      {data.data.pcd_data.map((point) => {
        const latestSurfaceWater =
          point.surface_water[point.surface_water.length - 1];
        const arsenicValue = latestSurfaceWater
          ? parseArsenicValue(latestSurfaceWater.AS)
          : 0;
        const contamination = getContaminationLevel(arsenicValue);

        return (
          <Marker
            key={`pcd-${point.id}`}
            position={[point.lat, point.lng]}
            icon={createContaminationIcon(contamination.level)}
          >
            <Popup maxWidth={200} className="kok-watch-popup">
              {createPCDPopupContent(point)}
            </Popup>
          </Marker>
        );
      })}

      {/* Mae Fah Luang Monitoring Points */}
      {data.data.maefahluang_data.map((point, index) => {
        const latestData = point.data[point.data.length - 1];
        const arsenicValue = latestData ? parseArsenicValue(latestData.AS) : 0;
        const contamination = getContaminationLevel(arsenicValue);

        return (
          <Marker
            key={`mfl-${index}`}
            position={[point.lat, point.lng]}
            icon={createContaminationIcon(contamination.level)}
          >
            <Popup maxWidth={200} className="kok-watch-popup">
              {createMaeFahLuangPopupContent(point)}
            </Popup>
          </Marker>
        );
      })}
    </LayerGroup>
  );
};

export default KokWatchMonitoringLayer;
