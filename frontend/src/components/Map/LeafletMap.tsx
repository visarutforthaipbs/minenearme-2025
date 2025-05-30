import React, { useEffect, useState } from "react";
import { Box, VStack, Checkbox } from "@chakra-ui/react";
import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FeatureCollection } from "geojson";

// Import GeoJSON files using Vite's ?url query parameter
import thMinesUrl from "../../data/TH-active-mine-2025.geojson?url";
import mmMinesUrl from "../../data/MM-active-mine.geojson?url";

// Define tile URLs for different base maps
const TILE_URLS = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

// Define attributions for different base maps
const ATTRIBUTIONS = {
  light: "© OpenStreetMap contributors © CartoDB",
  dark: "© OpenStreetMap contributors © CartoDB Dark Matter",
  satellite: "© Esri, USGS, NOAA",
};

// Custom CSS for the dark map overlay method
const darkOverlayStyle = `
  .dark-map-overlay::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    pointer-events: none;
    z-index: 400;
  }
`;

// Custom CSS for mine polygons
const minePolygonStyle = `
  .thai-mine-polygon {
    fill: #ff7800 !important;
    fill-opacity: 0.4 !important;
    stroke: #ff7800 !important;
    stroke-width: 2px !important;
  }
  
  .myanmar-mine-polygon {
    fill: #009688 !important;
    fill-opacity: 0.4 !important;
    stroke: #009688 !important;
    stroke-width: 2px !important;
  }
`;

// This component forces map to reload when baseMap changes
const TileLayerUpdater = ({
  baseMap,
}: {
  baseMap: "light" | "dark" | "satellite";
}) => {
  const map = useMap();
  const [tileError, setTileError] = useState(false);

  // Force a map redraw when baseMap changes
  useEffect(() => {
    const mapContainer = map.getContainer();

    // If we're using dark mode with a fallback
    if (baseMap === "dark" && tileError) {
      mapContainer.classList.add("dark-map-overlay");
    } else {
      mapContainer.classList.remove("dark-map-overlay");
    }

    // Safely invalidate map size
    try {
      // Wait for map to be fully initialized
      const timer = setTimeout(() => {
        // Safely check if map is ready
        if (map && typeof map.invalidateSize === "function") {
          map.invalidateSize();
        }
      }, 300);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error invalidating map:", error);
    }
  }, [baseMap, map, tileError]);

  // Handle tile error only when dark map is selected
  const handleTileError = () => {
    console.error("Failed to load dark map tiles");
    setTileError(true);
  };

  // Simple TileLayer approach - less conditional logic
  return (
    <TileLayer
      key={baseMap}
      url={TILE_URLS[baseMap]}
      attribution={ATTRIBUTIONS[baseMap]}
      detectRetina={true}
      eventHandlers={{
        tileerror: handleTileError,
        tileload: () => console.log(`Tile loaded for ${baseMap} map`),
      }}
    />
  );
};

interface LeafletMapProps {
  baseMap?: "light" | "dark" | "satellite";
  children?: React.ReactNode;
  center?: [number, number];
  zoom?: number;
  height?: string | number;
  onFeatureClick?: (feature: GeoJSON.Feature) => void;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  baseMap = "light",
  children,
  center = [13.736717, 100.523186],
  zoom = 6,
  height = "400px",
  onFeatureClick,
}) => {
  // Toggle state for layers
  const [showTH, setShowTH] = useState(true);
  const [showMM, setShowMM] = useState(true);

  // State for GeoJSON data
  const [thMines, setThMines] = useState<FeatureCollection | null>(null);
  const [mmMines, setMmMines] = useState<FeatureCollection | null>(null);

  // Add the dark overlay and mine polygon styles to the document
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = darkOverlayStyle + minePolygonStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fetch GeoJSON data
  useEffect(() => {
    // Fetch Thailand mines data
    fetch(thMinesUrl)
      .then((response) => response.json())
      .then((data) => {
        setThMines(data);
        console.log("Thailand mines data loaded successfully");
      })
      .catch((error) =>
        console.error("Error loading Thailand mines data:", error)
      );

    // Fetch Myanmar mines data
    fetch(mmMinesUrl)
      .then((response) => response.json())
      .then((data) => {
        setMmMines(data);
        console.log("Myanmar mines data loaded successfully");
      })
      .catch((error) =>
        console.error("Error loading Myanmar mines data:", error)
      );
  }, []);

  return (
    <Box w="100%" h={height} position="relative">
      <MapContainer
        key={`map-${baseMap}`} // Add key to force re-render when baseMap changes
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false} // Disable the default zoom controls
      >
        {/* Use the TileLayerUpdater component */}
        <TileLayerUpdater baseMap={baseMap} />

        {/* Conditionally render Thai mines */}
        {showTH && thMines && (
          <GeoJSON
            key={`thai-mines-${Date.now()}`} // Add key to force re-render
            data={thMines}
            style={() => {
              return {
                color: "#ff7800",
                weight: 2,
                fillColor: "#ff7800",
                fillOpacity: 0.4,
                className: "thai-mine-polygon", // Add a class for potential CSS targeting
              };
            }}
            onEachFeature={(feature, layer) => {
              // Use Thai-specific property for name
              const name =
                feature.properties?.[
                  "dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD1"
                ] || "ไม่ระบุชื่อ";

              // Bind popup with mine name
              layer.bindPopup(`<strong>${name}</strong>`);

              // Force the style on each layer - use type assertion for Path
              (layer as L.Path).setStyle({
                color: "#000",
                weight: 1,
                fillColor: "#ff7800",
                fillOpacity: 0.8,
              });

              // Add click handler if provided
              if (onFeatureClick) {
                layer.on({
                  click: () => onFeatureClick(feature),
                });
              }
            }}
          />
        )}

        {/* Conditionally render Myanmar mines */}
        {showMM && mmMines && (
          <GeoJSON
            key={`myanmar-mines-${Date.now()}`} // Add key to force re-render
            data={mmMines}
            style={() => ({
              color: "#009688",
              weight: 2,
              fillColor: "#009688",
              fillOpacity: 0.4,
              className: "myanmar-mine-polygon", // Add a class for potential CSS targeting
            })}
            onEachFeature={(feature, layer) => {
              // Use Myanmar-specific property for name
              const name = feature.properties?.o_nmME || "ไม่ระบุชื่อ";

              // Bind popup with mine name
              layer.bindPopup(`<strong>${name}</strong>`);

              // Force the style on each layer - use type assertion for Path
              (layer as L.Path).setStyle({
                color: "#009688",
                weight: 2,
                fillColor: "#009688",
                fillOpacity: 0.4,
              });

              // Add click handler if provided
              if (onFeatureClick) {
                layer.on({
                  click: () => onFeatureClick(feature),
                });
              }
            }}
          />
        )}

        {/* Render any additional children passed to the component */}
        {children}
      </MapContainer>

      {/* Add layer control checkboxes */}
      <VStack
        position="absolute"
        top="4"
        left="4"
        bg="whiteAlpha.800"
        p="3"
        borderRadius="md"
        zIndex="10"
      >
        <Checkbox isChecked={showTH} onChange={() => setShowTH(!showTH)}>
          🇹🇭 เหมืองไทย
        </Checkbox>
        <Checkbox isChecked={showMM} onChange={() => setShowMM(!showMM)}>
          🇲🇲 เหมืองเมียนมา
        </Checkbox>
      </VStack>
    </Box>
  );
};

export default LeafletMap;
