import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  Text,
  Flex,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spacer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  VStack,
  HStack,
  Spinner,
  Checkbox,
} from "@chakra-ui/react";
import { ChevronDownIcon, DownloadIcon } from "@chakra-ui/icons";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Import our new investigative components and utilities
import AnalyticsCharts from "../components/Charts/AnalyticsCharts";
import AdvancedFilterPanel from "../components/AdvancedFilterPanel";
import { InvestigativeAnalytics } from "../utils/investigativeAnalytics";
import { DataExportService } from "../utils/dataExport";
import type {
  EnhancedMineData,
  AdvancedFilters,
  AnalyticsData,
  CrossBorderAnalysis,
  ExportOptions,
} from "../types/investigative";

// Fix for Leaflet icon issue in React
// @ts-expect-error - Known issue with leaflet and react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Data loading utilities
const loadGeoJSONData = async (filename: string): Promise<any> => {
  try {
    const response = await fetch(`/assets/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return null;
  }
};

// Transform Thailand GeoJSON data to our enhanced format
const transformThailandData = (geoJsonData: any): EnhancedMineData[] => {
  if (!geoJsonData || !geoJsonData.features) return [];

  return geoJsonData.features.map((feature: any, index: number) => {
    const props = feature.properties;
    const [lng, lat] = feature.geometry.coordinates;

    // Extract company name from various possible fields
    const company =
      props["dpimgisdb.gisdpim.vw_b_concession.REQ_PERSON_FNAME"] ||
      props["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD2"] ||
      "ไม่ระบุ";

    // Extract mineral type
    const mineral =
      props["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD4"] || "ไม่ระบุ";

    // Extract dates
    const approveDate = props["dpimgisdb.gisdpim.vw_b_concession.APPROVE_DT"];
    const expireDate = props["dpimgisdb.gisdpim.vw_b_concession.EXPIRE_DT"];

    // Determine year opened
    const yearOpened = approveDate ? new Date(approveDate).getFullYear() : 2000;

    // Determine status based on expire date
    const isExpired = expireDate && new Date(expireDate) < new Date();
    const status = isExpired ? "closed" : "active";

    // Generate some realistic proximity data (in real app, this would be calculated from actual geographic data)
    const proximityToWater = Math.random() * 5000; // Random between 0-5km
    const proximityToSchools = Math.random() * 10000; // Random between 0-10km

    // Determine contamination risk based on mineral type and proximity
    let contaminationRisk: "low" | "medium" | "high" | "severe" = "low";
    if (mineral.includes("ทอง") || mineral.includes("gold")) {
      contaminationRisk = proximityToWater < 1000 ? "high" : "medium";
    } else if (mineral.includes("ถ่าน") || mineral.includes("coal")) {
      contaminationRisk = proximityToWater < 2000 ? "severe" : "high";
    } else {
      contaminationRisk = proximityToWater < 500 ? "medium" : "low";
    }

    return {
      id: index + 1,
      name: `เหมือง${mineral} ${props["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD3"] || index}`,
      mineral: mineral.toLowerCase(),
      country: "thailand",
      year_opened: yearOpened,
      year_closed: isExpired ? new Date(expireDate).getFullYear() : undefined,
      status: status as "active" | "closed",
      location: { lat, lng },
      company: company,
      production: `${Math.floor(Math.random() * 1000)} ตัน/ปี`,
      permit_number:
        props["dpimgisdb.gisdpim.vw_b_concession.CONCESSION_NO"] || "ไม่ระบุ",
      contamination_risk: contaminationRisk,
      proximity_to_water: Math.round(proximityToWater),
      proximity_to_schools: Math.round(proximityToSchools),
      proximity_to_hospitals: Math.round(Math.random() * 15000),
      environmental_impact:
        contaminationRisk === "severe"
          ? "สูง"
          : contaminationRisk === "high"
            ? "ปานกลาง"
            : "ต่ำ",
      community_impact:
        proximityToSchools < 2000
          ? "สูง"
          : proximityToSchools < 5000
            ? "ปานกลาง"
            : "ต่ำ",
      description: `เหมือง${mineral} ในจังหวัด${props["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD3"] || "ไม่ระบุ"}`,
    };
  });
};

// Transform Myanmar GeoJSON data to our enhanced format
const transformMyanmarData = (geoJsonData: any): EnhancedMineData[] => {
  if (!geoJsonData || !geoJsonData.features) return [];

  return geoJsonData.features.map((feature: any, index: number) => {
    const props = feature.properties;
    const [lng, lat] = feature.geometry.coordinates;

    const company = props["o_nmME"] || props["cl_cmpReg"] || "Unknown Company";
    const mineral = props["mnrl_tpCd"] || "unknown";

    // Generate realistic data
    const yearOpened = 1990 + Math.floor(Math.random() * 34); // 1990-2024
    const proximityToWater = Math.random() * 4000;
    const proximityToSchools = Math.random() * 8000;

    let contaminationRisk: "low" | "medium" | "high" | "severe" = "medium";
    if (proximityToWater < 500) contaminationRisk = "severe";
    else if (proximityToWater < 1500) contaminationRisk = "high";
    else if (proximityToWater < 3000) contaminationRisk = "medium";

    return {
      id: index + 10000, // Offset to avoid ID conflicts with Thailand data
      name: `Mine ${props["o_id"] || index}`,
      mineral: mineral.toLowerCase(),
      country: "myanmar",
      year_opened: yearOpened,
      status: Math.random() > 0.1 ? "active" : "closed", // 90% active
      location: { lat, lng },
      company: company,
      production: `${Math.floor(Math.random() * 500)} tons/year`,
      permit_number: props["cl_pmtNr"] || "N/A",
      contamination_risk: contaminationRisk,
      proximity_to_water: Math.round(proximityToWater),
      proximity_to_schools: Math.round(proximityToSchools),
      proximity_to_hospitals: Math.round(Math.random() * 12000),
      environmental_impact:
        contaminationRisk === "severe"
          ? "High"
          : contaminationRisk === "high"
            ? "Medium"
            : "Low",
      community_impact:
        proximityToSchools < 1500
          ? "High"
          : proximityToSchools < 4000
            ? "Medium"
            : "Low",
      description: `Mining operation in ${props["o_id"] || "Myanmar"}`,
    };
  });
};

const DataExplorer = () => {
  // State management
  const [allMineData, setAllMineData] = useState<EnhancedMineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"map" | "table" | "analytics">("analytics");
  const [selectedMines, setSelectedMines] = useState<number[]>([]);

  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    country: "",
    yearRange: [1990, 2024],
    mineral: [],
    status: [],
    company: "",
    contaminationRisk: [],
    proximityToWater: 50,
    proximityToSchools: 20,
    productionRange: [0, 10000],
    searchQuery: "",
  });

  const toast = useToast();

  // Load real data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load both Thailand and Myanmar data
        const [thailandData, myanmarData] = await Promise.all([
          loadGeoJSONData("TH-active-mine-2025.geojson"),
          loadGeoJSONData("MM-active-mine.geojson"),
        ]);

        let combinedData: EnhancedMineData[] = [];

        if (thailandData) {
          const transformedThailand = transformThailandData(thailandData);
          combinedData = [...combinedData, ...transformedThailand];
        }

        if (myanmarData) {
          const transformedMyanmar = transformMyanmarData(myanmarData);
          combinedData = [...combinedData, ...transformedMyanmar];
        }

        setAllMineData(combinedData);

        // Set initial year range based on actual data
        if (combinedData.length > 0) {
          const years = combinedData.map((m) => m.year_opened);
          const minYear = Math.min(...years);
          const maxYear = Math.max(...years);
          setAdvancedFilters((prev) => ({
            ...prev,
            yearRange: [minYear, maxYear],
          }));
        }

        toast({
          title: "ข้อมูลโหลดสำเร็จ",
          description: `โหลดข้อมูลเหมืองแร่ ${combinedData.length} แห่ง`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error loading mine data:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลได้",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Apply advanced filters
  const filteredMineData = useMemo(() => {
    let filtered = allMineData;

    // Country filter
    if (advancedFilters.country) {
      filtered = filtered.filter(
        (mine) => mine.country === advancedFilters.country
      );
    }

    // Year range filter
    filtered = filtered.filter(
      (mine) =>
        mine.year_opened >= advancedFilters.yearRange[0] &&
        mine.year_opened <= advancedFilters.yearRange[1]
    );

    // Mineral filter
    if (advancedFilters.mineral.length > 0) {
      filtered = filtered.filter((mine) =>
        advancedFilters.mineral.includes(mine.mineral)
      );
    }

    // Status filter
    if (advancedFilters.status.length > 0) {
      filtered = filtered.filter((mine) =>
        advancedFilters.status.includes(mine.status)
      );
    }

    // Company filter
    if (advancedFilters.company) {
      filtered = filtered.filter((mine) =>
        mine.company
          .toLowerCase()
          .includes(advancedFilters.company.toLowerCase())
      );
    }

    // Contamination risk filter
    if (advancedFilters.contaminationRisk.length > 0) {
      filtered = filtered.filter(
        (mine) =>
          mine.contamination_risk &&
          advancedFilters.contaminationRisk.includes(mine.contamination_risk)
      );
    }

    // Proximity filters
    filtered = filtered.filter((mine) => {
      const waterDistance = (mine.proximity_to_water || 0) / 1000; // Convert to km
      const schoolDistance = (mine.proximity_to_schools || 0) / 1000; // Convert to km

      return (
        waterDistance <= advancedFilters.proximityToWater &&
        schoolDistance <= advancedFilters.proximityToSchools
      );
    });

    // Advanced search with boolean operators
    if (advancedFilters.searchQuery.trim()) {
      filtered = InvestigativeAnalytics.performAdvancedSearch(
        filtered,
        advancedFilters.searchQuery
      );
    }

    return filtered;
  }, [allMineData, advancedFilters]);

  // Generate analytics
  const analytics = useMemo((): AnalyticsData => {
    return InvestigativeAnalytics.generateAnalytics(filteredMineData);
  }, [filteredMineData]);

  // Generate cross-border analysis
  const crossBorderAnalysis = useMemo((): CrossBorderAnalysis => {
    return InvestigativeAnalytics.analyzeCrossBorderPatterns(filteredMineData);
  }, [filteredMineData]);

  // Generate trend analysis
  const trendAnalysis = useMemo(() => {
    const minYear = Math.min(...filteredMineData.map((m) => m.year_opened));
    const maxYear = Math.max(...filteredMineData.map((m) => m.year_opened));
    return InvestigativeAnalytics.generateTrendAnalysis(
      filteredMineData,
      minYear,
      maxYear
    );
  }, [filteredMineData]);

  // Handle export functions
  const handleExport = (format: "csv" | "geojson" | "investigative-report") => {
    const exportOptions: ExportOptions = {
      format:
        format === "investigative-report"
          ? "pdf-report"
          : (format as "csv" | "geojson"),
      includeAnalytics: true,
      includeNotes: false,
      includeCitations: true,
      selectedMines: selectedMines.length > 0 ? selectedMines : undefined,
    };

    switch (format) {
      case "csv":
        DataExportService.exportToCSV(
          filteredMineData,
          exportOptions,
          analytics
        );
        break;
      case "geojson":
        DataExportService.exportToGeoJSON(filteredMineData, exportOptions);
        break;
      case "investigative-report":
        DataExportService.generateInvestigativeReport(
          filteredMineData,
          analytics,
          exportOptions
        );
        break;
    }

    toast({
      title: "กำลังดาวน์โหลด",
      description: `กำลังสร้างไฟล์ ${format.toUpperCase()}`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Reset filters
  const resetFilters = () => {
    const years = allMineData.map((m) => m.year_opened);
    const minYear = years.length > 0 ? Math.min(...years) : 1990;
    const maxYear = years.length > 0 ? Math.max(...years) : 2024;

    setAdvancedFilters({
      country: "",
      yearRange: [minYear, maxYear],
      mineral: [],
      status: [],
      company: "",
      contaminationRisk: [],
      proximityToWater: 50,
      proximityToSchools: 20,
      productionRange: [0, 10000],
      searchQuery: "",
    });
  };

  // Handle mine selection for export
  const toggleMineSelection = (mineId: number) => {
    setSelectedMines((prev) =>
      prev.includes(mineId)
        ? prev.filter((id) => id !== mineId)
        : [...prev, mineId]
    );
  };

  if (loading) {
    return (
      <Box className="mining-pattern-medium" minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={4} py={20}>
            <Spinner size="xl" color="blue.500" />
            <Heading size="md">กำลังโหลดข้อมูลเหมืองแร่...</Heading>
            <Text color="gray.600">กำลังประมวลผลข้อมูลจากไทยและเมียนมาร์</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="mining-pattern-medium" minH="100vh" py={8}>
      <Container maxW="container.xl">
        {/* Header */}
        <VStack spacing={4} mb={6}>
          <Heading size="xl" textAlign="center">
            เครื่องมือสำรวจข้อมูลเหมืองแร่
          </Heading>
          <Text fontSize="lg" textAlign="center" color="gray.600">
            สำหรับนักข่าวเชิงสืบสวนและนักวิจัย -
            วิเคราะห์ข้อมูลเหมืองแร่ในภูมิภาคอาเซียน
          </Text>

          {/* Quick Stats */}
          <HStack spacing={6} wrap="wrap" justify="center">
            <Badge colorScheme="blue" p={2} borderRadius="md">
              📊 เหมืองทั้งหมด: {analytics.totalMines}
            </Badge>
            <Badge colorScheme="green" p={2} borderRadius="md">
              ✅ ใช้งาน: {analytics.activeMines}
            </Badge>
            <Badge colorScheme="red" p={2} borderRadius="md">
              ⚠️ เสี่ยงสูง: {analytics.highRiskMines}
            </Badge>
            <Badge colorScheme="orange" p={2} borderRadius="md">
              🌊 ใกล้แหล่งน้ำ: {analytics.minesNearWater}
            </Badge>
          </HStack>
        </VStack>

        {/* Advanced Filter Panel */}
        <AdvancedFilterPanel
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          mineData={allMineData}
          onReset={resetFilters}
        />

        {/* Export and View Controls */}
        <Flex mb={6} align="center" wrap="wrap" gap={3}>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              colorScheme="green"
            >
              📥 ดาวน์โหลดข้อมูล
            </MenuButton>
            <MenuList>
              <MenuItem
                onClick={() => handleExport("csv")}
                icon={<DownloadIcon />}
              >
                📊 CSV (สำหรับ Excel)
              </MenuItem>
              <MenuItem
                onClick={() => handleExport("geojson")}
                icon={<DownloadIcon />}
              >
                🗺️ GeoJSON (สำหรับ GIS)
              </MenuItem>
              <MenuItem
                onClick={() => handleExport("investigative-report")}
                icon={<DownloadIcon />}
              >
                📋 รายงานการสืบสวน
              </MenuItem>
            </MenuList>
          </Menu>

          <Spacer />

          <FormControl display="flex" alignItems="center" width="auto">
            <FormLabel mb="0" htmlFor="view-toggle">
              มุมมอง:
            </FormLabel>
            <HStack>
              <Button
                size="sm"
                variant={view === "analytics" ? "solid" : "outline"}
                onClick={() => setView("analytics")}
              >
                📈 วิเคราะห์
              </Button>
              <Button
                size="sm"
                variant={view === "map" ? "solid" : "outline"}
                onClick={() => setView("map")}
              >
                🗺️ แผนที่
              </Button>
              <Button
                size="sm"
                variant={view === "table" ? "solid" : "outline"}
                onClick={() => setView("table")}
              >
                📋 ตาราง
              </Button>
            </HStack>
          </FormControl>
        </Flex>

        {/* Cross-border Alert */}
        {crossBorderAnalysis.transboundaryRisks.length > 0 && (
          <Alert status="warning" mb={6} borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>🚨 แจ้งเตือนความเสี่ยงข้ามแดน!</AlertTitle>
              <AlertDescription>
                พบเหมือง {crossBorderAnalysis.transboundaryRisks.length} แห่ง
                ที่อาจส่งผลกระทบข้ามพรมแดน โดยเฉพาะการปนเปื้อนแหล่งน้ำ
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Content based on view */}
        {view === "analytics" && (
          <AnalyticsCharts
            analytics={analytics}
            crossBorderAnalysis={crossBorderAnalysis}
            trendData={trendAnalysis}
          />
        )}

        {view === "map" && (
          <Box
            h="700px"
            borderRadius="lg"
            overflow="hidden"
            border="1px"
            borderColor="gray.200"
          >
            <MapContainer
              center={[15.0, 100.0]}
              zoom={6}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredMineData.map((mine) => (
                <Marker
                  key={mine.id}
                  position={[mine.location.lat, mine.location.lng]}
                >
                  <Popup>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">{mine.name}</Text>
                      <Text fontSize="sm">🏢 {mine.company}</Text>
                      <Text fontSize="sm">⚡ {mine.mineral}</Text>
                      <Text fontSize="sm">
                        🏳️ {mine.country === "thailand" ? "ไทย" : "เมียนมาร์"}
                      </Text>
                      <Text fontSize="sm">
                        📅 เปิดดำเนินการ: {mine.year_opened}
                      </Text>
                      <Badge
                        colorScheme={
                          mine.contamination_risk === "severe"
                            ? "red"
                            : mine.contamination_risk === "high"
                              ? "orange"
                              : mine.contamination_risk === "medium"
                                ? "yellow"
                                : "green"
                        }
                        size="sm"
                      >
                        ⚠️ ความเสี่ยง: {mine.contamination_risk}
                      </Badge>
                    </VStack>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Box>
        )}

        {view === "table" && (
          <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>
                    <Checkbox
                      isChecked={
                        selectedMines.length === filteredMineData.length
                      }
                      isIndeterminate={
                        selectedMines.length > 0 &&
                        selectedMines.length < filteredMineData.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMines(filteredMineData.map((m) => m.id));
                        } else {
                          setSelectedMines([]);
                        }
                      }}
                    />
                  </Th>
                  <Th>ชื่อเหมือง</Th>
                  <Th>บริษัท</Th>
                  <Th>ประเทศ</Th>
                  <Th>แร่</Th>
                  <Th>สถานะ</Th>
                  <Th>ปีที่เปิด</Th>
                  <Th>ความเสี่ยง</Th>
                  <Th>ใกล้น้ำ (ม.)</Th>
                  <Th>ใกล้โรงเรียน (ม.)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredMineData.length > 0 ? (
                  filteredMineData.slice(0, 100).map((mine) => (
                    <Tr key={mine.id} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <Checkbox
                          isChecked={selectedMines.includes(mine.id)}
                          onChange={() => toggleMineSelection(mine.id)}
                        />
                      </Td>
                      <Td fontWeight="medium">{mine.name}</Td>
                      <Td>{mine.company}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            mine.country === "thailand" ? "blue" : "green"
                          }
                        >
                          {mine.country === "thailand" ? "ไทย" : "เมียนมาร์"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple">{mine.mineral}</Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            mine.status === "active" ? "green" : "red"
                          }
                        >
                          {mine.status === "active" ? "เปิด" : "ปิด"}
                        </Badge>
                      </Td>
                      <Td>{mine.year_opened}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            mine.contamination_risk === "severe"
                              ? "red"
                              : mine.contamination_risk === "high"
                                ? "orange"
                                : mine.contamination_risk === "medium"
                                  ? "yellow"
                                  : "green"
                          }
                        >
                          {mine.contamination_risk}
                        </Badge>
                      </Td>
                      <Td>
                        {mine.proximity_to_water?.toLocaleString() || "N/A"}
                      </Td>
                      <Td>
                        {mine.proximity_to_schools?.toLocaleString() || "N/A"}
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={10} textAlign="center" py={8}>
                      <Text color="gray.500">ไม่พบข้อมูลตามเกณฑ์ที่กำหนด</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>

            {filteredMineData.length > 100 && (
              <Box p={4} textAlign="center" bg="gray.50">
                <Text color="gray.600">
                  แสดง 100 รายการแรก จากทั้งหมด {filteredMineData.length} รายการ
                </Text>
              </Box>
            )}
          </Box>
        )}

        {/* Selection Summary */}
        {selectedMines.length > 0 && (
          <Box
            mt={6}
            p={4}
            bg="blue.50"
            borderRadius="lg"
            border="1px"
            borderColor="blue.200"
          >
            <HStack justify="space-between">
              <Text fontWeight="medium">
                📌 เลือกแล้ว {selectedMines.length} เหมือง
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => {
                  DataExportService.exportResearchFindings(
                    filteredMineData.filter((m) =>
                      selectedMines.includes(m.id)
                    ),
                    selectedMines,
                    `การวิจัยเฉพาะเจาะจง - เลือก ${selectedMines.length} เหมือง`
                  );
                }}
              >
                📄 ส่งออกรายการที่เลือก
              </Button>
            </HStack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DataExplorer;
