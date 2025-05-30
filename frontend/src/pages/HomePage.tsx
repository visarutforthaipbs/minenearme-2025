import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Heading,
  Select,
  useColorMode,
  List,
  ListItem,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import type { Feature, FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";
import { useLocation } from "react-router-dom";
import DetailSidebar from "@/components/Map/DetailSidebar";
import type { MineListItem } from "@/components/Map/DetailSidebar";
import { FaSearch, FaMapMarkedAlt } from "react-icons/fa";
import LeafletMap from "@/components/Map/LeafletMap";

// Import GeoJSON data
import thMinesUrl from "../data/TH-active-mine-2025.geojson?url";
import mmMinesUrl from "../data/MM-active-mine.geojson?url";

// Define feature type for search results
interface SearchFeature {
  id: number;
  name: string;
  type: "mine" | "myanmar" | "risk";
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
}

interface MapControllerProps {
  focusFeature: SearchFeature | null;
}

// Component to handle geolocation and focused features
const MapController: React.FC<MapControllerProps> = ({ focusFeature }) => {
  const map = useMap();
  const toast = useToast();

  // Focus on a feature when the component receives focus data
  useEffect(() => {
    if (focusFeature) {
      try {
        // Handle different geometry types
        if (focusFeature.geometry.type === "Point") {
          const [lng, lat] = focusFeature.geometry.coordinates as number[];
          map.setView([lat, lng], 12);

          // Show a temporary marker
          const marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`<strong>${focusFeature.name}</strong>`)
            .openPopup();

          // Remove marker after 5 seconds
          setTimeout(() => {
            map.removeLayer(marker);
          }, 5000);
        } else if (
          focusFeature.geometry.type === "Polygon" ||
          focusFeature.geometry.type === "MultiPolygon"
        ) {
          // Create a GeoJSON layer to get the bounds
          const layer = L.geoJSON({
            type: "Feature",
            properties: focusFeature.properties,
            geometry: focusFeature.geometry,
          } as Feature);

          // Fit the map to the bounds of the polygon with some padding
          map.fitBounds(layer.getBounds(), { padding: [50, 50] });
        }

        // Display toast notification
        const typeInfo = {
          mine: { title: "เหมืองไทย", color: "orange" },
          myanmar: { title: "เหมืองเมียนมา", color: "teal" },
          risk: { title: "โซนเสี่ยง", color: "red" },
        }[focusFeature.type];

        toast({
          title: `${typeInfo.title}: ${focusFeature.name}`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
          render: () => (
            <Box
              bg="#004C4B"
              color="white"
              p={3}
              borderRadius="md"
              boxShadow="md"
            >
              <Text fontWeight="bold">
                {`${typeInfo.title}: ${focusFeature.name}`}
              </Text>
            </Box>
          ),
        });
      } catch (error) {
        console.error("Error focusing on feature:", error);
      }
    }
  }, [focusFeature, map, toast]);

  return null;
};

// Component to handle locate button functionality - this goes inside MapContainer
const MapLocator = () => {
  const map = useMap();

  // Expose locate function to window for external control
  useEffect(() => {
    // Define window interface with our custom property
    interface CustomWindow extends Window {
      locateUser?: () => void;
    }

    const customWindow = window as CustomWindow;
    customWindow.locateUser = () => {
      map.locate({ setView: true, maxZoom: 10 });
    };

    return () => {
      delete customWindow.locateUser;
    };
  }, [map]);

  return null;
};

// Style functions for GeoJSON
const thMineStyle = {
  radius: 8,
  fillColor: "#ff7800",
  weight: 1,
  opacity: 1,
  color: "#000",
  fillOpacity: 0.8,
};

const mmMineStyle = {
  fillColor: "#009688",
  weight: 2,
  opacity: 1,
  color: "#009688",
  fillOpacity: 0.4,
};

const riskZoneStyle = {
  fillColor: "#d9534f",
  weight: 2,
  opacity: 1,
  color: "#b52b27",
  fillOpacity: 0.4,
};

/**
 * Calculate distance between two coordinates in kilometers using the Haversine formula
 */
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Add the NearbyCircle component
interface NearbyCircleProps {
  userLocation: [number, number];
  radius: number; // in kilometers
}

const NearbyCircle: React.FC<NearbyCircleProps> = ({
  userLocation,
  radius,
}) => {
  const map = useMap();

  useEffect(() => {
    // Create a circle with the given radius around the user location
    const circle = L.circle(userLocation, {
      radius: radius * 1000, // Convert km to meters
      color: "#004C4B",
      fillColor: "#004C4B",
      fillOpacity: 0.1,
      weight: 2,
    }).addTo(map);

    // Create custom icon for user location
    const customIcon = L.icon({
      iconUrl: "/assets/icon/current-homemap-icon.svg",
      iconSize: [32, 32], // size of the icon
      iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
      popupAnchor: [0, -16], // point from which the popup should open relative to the iconAnchor
    });

    // Create custom popup with styled content
    const customPopup = L.popup().setContent(
      "<div style=\"font-family: 'DBHelvethaicaX', sans-serif;\">นี้คือพื้นที่ 30 กิโลเมตร รอบคุณ</div>"
    );

    // Add a marker at the user's location
    const marker = L.marker(userLocation, { icon: customIcon })
      .addTo(map)
      .bindPopup(customPopup)
      .openPopup();

    // Add the font to the document if not already added
    if (!document.getElementById("custom-font-style")) {
      const style = document.createElement("style");
      style.id = "custom-font-style";
      style.textContent = `
        @font-face {
          font-family: 'DBHelvethaicaX';
          src: url('/assets/font/dbhelvethaicax-webfont.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }
      `;
      document.head.appendChild(style);
    }

    // Fit the map to show the entire circle
    map.fitBounds(circle.getBounds(), { padding: [50, 50] });

    // Clean up when component unmounts
    return () => {
      map.removeLayer(circle);
      map.removeLayer(marker);
    };
  }, [map, userLocation, radius]);

  return null;
};

const HomePage = () => {
  // Access the toast function from Chakra UI
  const toast = useToast();

  // Get location state with any focused feature
  const location = useLocation();
  const focusFeature = location.state?.focusFeature as SearchFeature | null;
  const { colorMode } = useColorMode();

  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchFeature[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // State for base map style
  const [baseMap, setBaseMap] = useState<"light" | "dark" | "satellite">(
    colorMode === "dark" ? "dark" : "light"
  );

  // Update baseMap when colorMode changes
  useEffect(() => {
    // Only auto-switch if we haven't manually selected a map style
    const userHasSelected = sessionStorage.getItem("userSelectedMapStyle");

    if (!userHasSelected) {
      if (colorMode === "dark" && baseMap === "light") {
        console.log("Auto-switching to dark map based on color mode");
        setBaseMap("dark");
      } else if (colorMode === "light" && baseMap === "dark") {
        console.log("Auto-switching to light map based on color mode");
        setBaseMap("light");
      }
    }
  }, [colorMode, baseMap]);

  // State for map layers
  const [showThMines, setShowThMines] = useState(true);
  const [showMmMines, setShowMmMines] = useState(false);
  const [showRiskZones, setShowRiskZones] = useState(false);

  // State for the detail sidebar - using Feature for type compatibility with DetailSidebar
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // New state for focusing on a feature in the map
  const [focusOnFeature, setFocusOnFeature] = useState<SearchFeature | null>(
    null
  );

  // State for GeoJSON data
  const [thMines, setThMines] = useState<FeatureCollection | null>(null);
  const [mmMines, setMmMines] = useState<FeatureCollection | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [showProximityCircle, setShowProximityCircle] = useState(false);
  const [nearbyMines, setNearbyMines] = useState<MineListItem[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  // Load GeoJSON data
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

  // Close the sidebar
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedFeature(null);
  };

  // Load data after component mounts
  useEffect(() => {
    // In a real app, this would be a fetch call to an API

    // If we have a focus feature, automatically enable its layer
    if (focusFeature) {
      switch (focusFeature.type) {
        case "mine":
          setShowThMines(true);
          break;
        case "myanmar":
          setShowMmMines(true);
          break;
        case "risk":
          setShowRiskZones(true);
          break;
        default:
          break;
      }

      // Show the focus feature in the sidebar
      // Convert SearchFeature to Feature for the sidebar
      const featureForSidebar: Feature = {
        type: "Feature",
        properties: {
          ...focusFeature.properties,
          name: focusFeature.name,
          id: focusFeature.id,
        },
        geometry: focusFeature.geometry as any,
      };

      setSelectedFeature(featureForSidebar);
      setIsSidebarOpen(true);
    }
  }, [focusFeature]);

  // Handle feature click
  const handleFeatureClick = (
    feature: Feature,
    _type: "mine" | "potential" | "risk"
  ) => {
    // Set the feature directly for sidebar display
    setSelectedFeature(feature);
    setIsSidebarOpen(true);
  };

  // Popup content for each mine point
  const onEachThMine = (feature: Feature, layer: L.Layer) => {
    const name = feature.properties?.name || "Unnamed Mine";
    layer.bindPopup(`<strong>${name}</strong>`);
    layer.on({
      click: () => {
        handleFeatureClick(feature, "mine");
      },
    });
  };

  // Popup content for potential zones
  const onEachMmMine = (feature: Feature, layer: L.Layer) => {
    const name = feature.properties?.name || "Unnamed Zone";
    layer.bindPopup(`<strong>${name}</strong>`);
    layer.on({
      click: () => {
        handleFeatureClick(feature, "potential");
      },
    });
  };

  // Popup content for risk zones
  const onEachRiskZone = (feature: Feature, layer: L.Layer) => {
    const name = feature.properties?.name || "Unnamed Risk Area";
    layer.bindPopup(`<strong>${name}</strong>`);
    layer.on({
      click: () => {
        handleFeatureClick(feature, "risk");
      },
    });
  };

  // Handle feature click from GeoJSON layer
  const handleGeoJSONFeatureClick = (feature: Feature) => {
    console.log("Feature clicked:", feature);
    setSelectedFeature(feature);
    setIsSidebarOpen(true);
  };

  // Add this function to handle locating and finding nearby mines
  const handleLocateAndFindNearby = useCallback(() => {
    setIsLoadingNearby(true);
    setSelectedFeature(null);

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(userPos);
          setShowProximityCircle(true);

          // Combine all mine data sources
          const allFeatures = [
            ...(thMines?.features || []),
            ...(mmMines?.features || []),
          ];

          // Find mines within 30km
          const RADIUS_KM = 30;
          const nearby = allFeatures
            .map((feature) => {
              // Extract coordinates based on geometry type
              let mineCoords: [number, number] | null = null;

              if (feature.geometry.type === "Point") {
                const [lon, lat] = feature.geometry.coordinates;
                mineCoords = [lat, lon];
              } else if (feature.geometry.type === "Polygon") {
                // Use the first point of the polygon as an approximation
                const [lon, lat] = feature.geometry.coordinates[0][0];
                mineCoords = [lat, lon];
              } else if (feature.geometry.type === "MultiPolygon") {
                // Use the first point of the first polygon as an approximation
                const [lon, lat] = feature.geometry.coordinates[0][0][0];
                mineCoords = [lat, lon];
              }

              if (!mineCoords) return null;

              // Calculate distance
              const distance = getDistanceFromLatLonInKm(
                userPos[0],
                userPos[1],
                mineCoords[0],
                mineCoords[1]
              );

              // Only include mines within the radius
              if (distance <= RADIUS_KM) {
                return {
                  id:
                    feature.properties?.[
                      "dpimgisdb.gisdpim.vw_b_concession.REQ_CONCESSION_ID"
                    ] ||
                    feature.properties?.ROW_ID ||
                    feature.properties?.o_id ||
                    Math.random().toString(36).substring(2, 10),
                  name:
                    feature.properties?.[
                      "dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD1"
                    ] ||
                    feature.properties?.o_nmME ||
                    "ไม่ระบุชื่อ",
                  distance,
                  feature,
                };
              }
              return null;
            })
            .filter(Boolean) as MineListItem[];

          // Sort by distance
          nearby.sort((a, b) => (a.distance || 0) - (b.distance || 0));

          setNearbyMines(nearby);
          setIsLoadingNearby(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingNearby(false);
          toast({
            title: "ไม่สามารถระบุตำแหน่งของคุณได้",
            description: "กรุณาเปิดใช้งานการเข้าถึงตำแหน่งและลองอีกครั้ง",
            status: "error",
            duration: 5000,
            isClosable: true,
            render: () => (
              <Box
                bg="#FF6600"
                color="white"
                p={3}
                borderRadius="md"
                boxShadow="md"
              >
                <Text fontWeight="bold">ไม่สามารถระบุตำแหน่งของคุณได้</Text>
                <Text fontSize="sm">
                  กรุณาเปิดใช้งานการเข้าถึงตำแหน่งและลองอีกครั้ง
                </Text>
              </Box>
            ),
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLoadingNearby(false);
      toast({
        title: "เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง",
        description: "กรุณาใช้เบราว์เซอร์ที่ทันสมัยกว่านี้",
        status: "error",
        duration: 5000,
        isClosable: true,
        render: () => (
          <Box
            bg="#FF6600"
            color="white"
            p={3}
            borderRadius="md"
            boxShadow="md"
          >
            <Text fontWeight="bold">เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง</Text>
            <Text fontSize="sm">กรุณาใช้เบราว์เซอร์ที่ทันสมัยกว่านี้</Text>
          </Box>
        ),
      });
    }
  }, [toast, thMines, mmMines]);

  // Add functions to handle list-detail interaction
  const handleMineSelect = useCallback((feature: Feature) => {
    setSelectedFeature(feature);

    // Determine if this is a Thai or Myanmar mine based on properties
    const isMyanmarMine = !!feature.properties?.o_nmME;

    // Convert the GeoJSON Feature to SearchFeature format for the map controller
    const searchFeature: SearchFeature = {
      id:
        feature.properties?.[
          "dpimgisdb.gisdpim.vw_b_concession.REQ_CONCESSION_ID"
        ] ||
        feature.properties?.ROW_ID ||
        feature.properties?.o_id ||
        Math.random(),
      name:
        feature.properties?.["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD1"] ||
        feature.properties?.o_nmME ||
        "ไม่ระบุชื่อ",
      type: isMyanmarMine ? "myanmar" : "mine",
      properties: feature.properties || {},
      geometry: feature.geometry as unknown as {
        type: string;
        coordinates: number[] | number[][] | number[][][];
      },
    };

    // Set the feature to focus on in the map
    setFocusOnFeature(searchFeature);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedFeature(null);
  }, []);

  // Search logic that works with our GeoJSON data schema
  const performSearch = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results: SearchFeature[] = [];

    // Search through Thailand mines
    if (thMines?.features) {
      thMines.features.forEach((feature) => {
        const props = feature.properties || {};

        // Extract searchable fields for Thailand mines
        const name =
          props["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD1"] || "";
        const permit = props["dpimgisdb.GISDPIM.MINING_PERMIT.PERMIT_ID"] || "";
        const mineral =
          props["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD4"] || "";
        const operator =
          props["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD2"] || "";
        const id =
          props["dpimgisdb.gisdpim.vw_b_concession.REQ_CONCESSION_ID"] ||
          props.ROW_ID ||
          "";

        // Check if any field matches the search query
        const searchableText =
          `${name} ${permit} ${mineral} ${operator} ${id}`.toLowerCase();

        if (searchableText.includes(query)) {
          results.push({
            id: id || Math.random(),
            name: name || "ไม่ระบุชื่อ",
            type: "mine",
            properties: props,
            geometry: feature.geometry as any,
          });
        }
      });
    }

    // Search through Myanmar mines
    if (mmMines?.features) {
      mmMines.features.forEach((feature) => {
        const props = feature.properties || {};

        // Extract searchable fields for Myanmar mines
        const name = props.o_nmME || "";
        const permit = props.PermitNo || "";
        const mineral = props.Commodity || "";
        const operator = props.LicHolder || "";
        const id = props.o_id || "";

        // Check if any field matches the search query
        const searchableText =
          `${name} ${permit} ${mineral} ${operator} ${id}`.toLowerCase();

        if (searchableText.includes(query)) {
          results.push({
            id: id || Math.random(),
            name: name || "ไม่ระบุชื่อ",
            type: "myanmar",
            properties: props,
            geometry: feature.geometry as any,
          });
        }
      });
    }

    // Limit results to 10 for performance
    setSearchResults(results.slice(0, 10));
    setShowSearchResults(results.length > 0);
  }, [searchQuery, thMines, mmMines]);

  // Effect to trigger search when query changes
  useEffect(() => {
    performSearch;
  }, [performSearch]);

  // Handle search result selection
  const handleSearchSelect = useCallback((selectedResult: SearchFeature) => {
    // Enable the appropriate layer
    if (selectedResult.type === "mine") {
      setShowThMines(true);
    } else if (selectedResult.type === "myanmar") {
      setShowMmMines(true);
    }

    // Convert to Feature for sidebar
    const featureForSidebar: Feature = {
      type: "Feature",
      properties: selectedResult.properties,
      geometry: selectedResult.geometry as any,
    };

    // Set selected feature and focus on it
    setSelectedFeature(featureForSidebar);
    setFocusOnFeature(selectedResult);

    // Clear search
    setSearchQuery("");
    setShowSearchResults(false);
  }, []);

  return (
    <Box position="relative" h="calc(100vh - 72px)">
      {/* Map Container */}
      <Box h="100%" w="100%">
        <LeafletMap
          baseMap={baseMap}
          center={focusFeature ? undefined : [13.736717, 100.523186]}
          zoom={focusFeature ? undefined : 6}
          height="100%"
          onFeatureClick={handleGeoJSONFeatureClick}
        >
          <MapController focusFeature={focusFeature || focusOnFeature} />
          <MapLocator />

          {/* Proximity Circle */}
          {showProximityCircle && userLocation && (
            <NearbyCircle userLocation={userLocation} radius={30} />
          )}

          {/* Thailand Mines */}
          {showThMines && thMines && (
            <GeoJSON
              data={thMines}
              pointToLayer={(feature, latlng) => {
                return L.circleMarker(latlng, thMineStyle);
              }}
              onEachFeature={onEachThMine}
            />
          )}

          {/* Myanmar Mines */}
          {showMmMines && mmMines && (
            <GeoJSON
              data={mmMines}
              style={mmMineStyle}
              onEachFeature={onEachMmMine}
            />
          )}

          {/* Risk Zones */}
          {showRiskZones && thMines && (
            <GeoJSON
              data={thMines}
              style={riskZoneStyle}
              onEachFeature={onEachRiskZone}
            />
          )}
        </LeafletMap>
      </Box>

      {/* Map Controls */}
      <Box
        className="mining-pattern-subtle"
        position="absolute"
        top={[2, 4]}
        left={[2, 4]}
        zIndex={500}
        width={["calc(100% - 16px)", "300px"]}
        maxWidth={["none", "300px"]}
        bg="white"
        boxShadow="md"
        borderRadius="md"
        p={[3, 4]}
        display={
          selectedFeature || nearbyMines.length > 0
            ? ["none", "block"]
            : "block"
        }
      >
        <VStack spacing={4} align="stretch">
          <Heading size="md" mb={2}>
            แผนที่เหมืองแร่ประเทศไทย
          </Heading>

          <Box position="relative">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="ค้นหาเหมืองหรือพื้นที่..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(searchResults.length > 0)}
                onBlur={() =>
                  setTimeout(() => setShowSearchResults(false), 200)
                }
              />
            </InputGroup>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <Box
                position="absolute"
                top="100%"
                left={0}
                right={0}
                bg="white"
                boxShadow="lg"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
                zIndex={1000}
                maxHeight="200px"
                overflowY="auto"
              >
                <List spacing={0}>
                  {searchResults.map((result, index) => (
                    <ListItem
                      key={`${result.type}-${result.id}-${index}`}
                      p={3}
                      cursor="pointer"
                      _hover={{ bg: "gray.50" }}
                      borderBottomWidth="1px"
                      borderColor="gray.100"
                      onClick={() => handleSearchSelect(result)}
                    >
                      <Flex justify="space-between" align="center">
                        <Box flex={1}>
                          <Text fontWeight="bold" fontSize="sm">
                            {result.name}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {result.type === "mine"
                              ? "เหมืองไทย"
                              : "เหมืองเมียนมา"}
                            {result.properties?.Commodity &&
                              ` • ${result.properties.Commodity}`}
                            {result.properties?.[
                              "dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD4"
                            ] &&
                              ` • ${result.properties["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD4"]}`}
                          </Text>
                        </Box>
                        <Badge
                          colorScheme={
                            result.type === "mine" ? "orange" : "teal"
                          }
                          size="sm"
                        >
                          {result.type === "mine" ? "TH" : "MM"}
                        </Badge>
                      </Flex>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          {/* Map Style Selector */}
          <Select
            value={baseMap}
            onChange={(e) => {
              sessionStorage.setItem("userSelectedMapStyle", "true");
              setBaseMap(e.target.value as "light" | "dark" | "satellite");
            }}
          >
            <option value="light">แผนที่ (Light)</option>
            <option value="dark">แผนที่ (Dark)</option>
            <option value="satellite">แผนที่ดาวเทียม</option>
          </Select>

          <Button
            leftIcon={<FaMapMarkedAlt />}
            colorScheme="blue"
            variant="outline"
            size="sm"
            w="full"
            onClick={handleLocateAndFindNearby}
            isLoading={isLoadingNearby}
            loadingText="กำลังค้นหา..."
          >
            ค้นหาเหมืองใกล้ฉัน
          </Button>
        </VStack>
      </Box>

      {/* Detail Sidebar - always visible */}
      <DetailSidebar
        selectedFeature={selectedFeature}
        onClose={() => setIsSidebarOpen(false)}
        nearbyMines={nearbyMines}
        isLoadingNearby={isLoadingNearby}
        onMineSelect={handleMineSelect}
        onBackToList={handleBackToList}
      />
    </Box>
  );
};

export default HomePage;
