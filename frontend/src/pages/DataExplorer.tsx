import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Stack,
  Switch,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  Select,
  Text,
  Flex,
  Icon,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spacer,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { ChevronDownIcon, DownloadIcon, InfoIcon } from "@chakra-ui/icons";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  activeMinesData,
  potentialZonesData,
  riskZonesData,
} from "../mockData/mineData";

// Fix for Leaflet icon issue in React
// @ts-ignore - Known issue with leaflet and react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Define our types
interface GeoJSONFeature {
  type: string;
  properties: {
    id: number;
    name: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
}

interface GeoJSONCollection {
  type: string;
  features: GeoJSONFeature[];
}

interface MineData {
  id: number;
  name: string;
  mineral: string;
  country: string;
  year: string;
  status: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface FilterValues {
  country: string;
  year: string;
  mineral: string;
  status: string;
}

// Extract active mines into a more usable format
const extractMineData = (geojsonData: GeoJSONCollection): MineData[] => {
  return geojsonData.features.map((feature) => {
    const properties = feature.properties;
    const [lng, lat] =
      feature.geometry.type === "Point"
        ? (feature.geometry.coordinates as number[])
        : [0, 0]; // Default if not a point

    return {
      id: properties.id,
      name: properties.name,
      mineral: properties.mineral,
      country: "thailand", // Default for demo
      year: properties.year_opened?.toString() || "2020", // Default
      status: properties.status || "active",
      location: { lat, lng },
    };
  });
};

// FilterPanel component that receives filter values and change handlers
interface FilterPanelProps {
  filters: FilterValues;
  handleFilterChange: (filterName: string, value: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  handleFilterChange,
}) => {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      spacing={4}
      mb={4}
      wrap="wrap"
    >
      <FormControl>
        <FormLabel>ประเทศ</FormLabel>
        <Select
          value={filters.country}
          onChange={(e) => handleFilterChange("country", e.target.value)}
        >
          <option value="">ทั้งหมด</option>
          <option value="thailand">ไทย</option>
          <option value="laos">ลาว</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>ปี</FormLabel>
        <Select
          value={filters.year}
          onChange={(e) => handleFilterChange("year", e.target.value)}
        >
          <option value="">ทั้งหมด</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
          <option value="2019">2019</option>
          <option value="2018">2018</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>แร่</FormLabel>
        <Select
          value={filters.mineral}
          onChange={(e) => handleFilterChange("mineral", e.target.value)}
        >
          <option value="">ทั้งหมด</option>
          <option value="gold">ทองคำ</option>
          <option value="coal">ถ่านหิน</option>
          <option value="limestone">หินปูน</option>
          <option value="zinc">สังกะสี</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>สถานะ</FormLabel>
        <Select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">ทั้งหมด</option>
          <option value="active">เปิดใช้งาน</option>
          <option value="closed">ปิดแล้ว</option>
        </Select>
      </FormControl>
    </Stack>
  );
};

// Style functions for GeoJSON
const potentialZoneStyle = {
  fillColor: "#5cb85c",
  weight: 2,
  opacity: 1,
  color: "#2d882d",
  fillOpacity: 0.4,
};

const riskZoneStyle = {
  fillColor: "#d9534f",
  weight: 2,
  opacity: 1,
  color: "#b52b27",
  fillOpacity: 0.4,
};

const DataExplorer = () => {
  // State for view mode
  const [view, setView] = useState("map");

  // State for data
  const [mineData, setMineData] = useState<MineData[]>([]);
  const [loading, setLoading] = useState(true);

  // State for filter values
  const [filters, setFilters] = useState({
    country: "",
    year: "",
    mineral: "",
    status: "",
  });

  // State for tab selection
  const [tabIndex, setTabIndex] = useState(0);

  // Load data on component mount
  useEffect(() => {
    // Simulate API fetch
    setLoading(true);

    setTimeout(() => {
      // Extract mine data from GeoJSON
      const extractedData = extractMineData(activeMinesData);
      setMineData(extractedData);
      setLoading(false);
    }, 500);
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters({
      ...filters,
      [filterName]: value,
    });
  };

  // Filter data based on current filters
  const filteredData = mineData.filter((item) => {
    if (filters.country && item.country !== filters.country) return false;
    if (filters.year && item.year !== filters.year) return false;
    if (filters.mineral && item.mineral !== filters.mineral) return false;
    if (filters.status && item.status !== filters.status) return false;
    return true;
  });

  // Handle downloading data
  const handleDownload = (format: string) => {
    // In a real app, this would generate and download the file
    console.log(`Downloading ${format} file...`);
    alert(`ดาวน์โหลดข้อมูลในรูปแบบ ${format}`);
  };

  // Generate statistics
  const getStatistics = () => {
    const totalMines = mineData.length;
    const activeMines = mineData.filter(
      (mine) => mine.status === "active"
    ).length;
    const goldMines = mineData.filter((mine) => mine.mineral === "gold").length;

    return {
      totalMines,
      activeMines,
      goldMines,
    };
  };

  const stats = getStatistics();

  return (
    <Box className="mining-pattern-medium" minH="100vh" py={8}>
      <Container maxW="container.xl">
        <Heading mb={4}>สำรวจข้อมูล</Heading>
        <Text mb={6} fontSize="lg">
          ค้นหาและกรองข้อมูลเกี่ยวกับเหมืองแร่ ตามเกณฑ์ต่าง ๆ
          และดูในมุมมองแผนที่หรือตาราง
        </Text>

        {loading ? (
          <Alert status="info">
            <AlertIcon />
            กำลังโหลดข้อมูล...
          </Alert>
        ) : (
          <>
            {/* Statistics */}
            <Grid
              templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
              gap={6}
              mb={6}
            >
              <GridItem>
                <Stat bg="blue.50" p={4} borderRadius="lg" boxShadow="sm">
                  <StatLabel>จำนวนเหมืองทั้งหมด</StatLabel>
                  <StatNumber>{stats.totalMines}</StatNumber>
                  <StatHelpText>จากฐานข้อมูลทั้งหมด</StatHelpText>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat bg="green.50" p={4} borderRadius="lg" boxShadow="sm">
                  <StatLabel>เหมืองที่เปิดใช้งาน</StatLabel>
                  <StatNumber>{stats.activeMines}</StatNumber>
                  <StatHelpText>
                    {Math.round((stats.activeMines / stats.totalMines) * 100)}%
                    ของทั้งหมด
                  </StatHelpText>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat bg="yellow.50" p={4} borderRadius="lg" boxShadow="sm">
                  <StatLabel>เหมืองทองคำ</StatLabel>
                  <StatNumber>{stats.goldMines}</StatNumber>
                  <StatHelpText>
                    {Math.round((stats.goldMines / stats.totalMines) * 100)}%
                    ของทั้งหมด
                  </StatHelpText>
                </Stat>
              </GridItem>
            </Grid>

            {/* Filter Panel */}
            <Box mb={6} bg="gray.50" p={4} borderRadius="md">
              <Flex align="center" mb={3}>
                <Icon as={InfoIcon} mr={2} color="blue.500" />
                <Text fontWeight="bold">กรองข้อมูล</Text>
              </Flex>
              <FilterPanel
                filters={filters}
                handleFilterChange={handleFilterChange}
              />
            </Box>

            {/* Download and View Toggle Buttons */}
            <Flex mb={4} align="center" wrap="wrap" gap={3}>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  colorScheme="green"
                >
                  ดาวน์โหลด
                </MenuButton>
                <MenuList>
                  <MenuItem
                    onClick={() => handleDownload("CSV")}
                    icon={<DownloadIcon />}
                  >
                    CSV
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleDownload("GeoJSON")}
                    icon={<DownloadIcon />}
                  >
                    GeoJSON
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleDownload("Excel")}
                    icon={<DownloadIcon />}
                  >
                    Excel
                  </MenuItem>
                </MenuList>
              </Menu>

              <Spacer />

              <FormControl display="flex" alignItems="center" width="auto">
                <FormLabel mb="0" htmlFor="view-toggle">
                  {view === "map" ? "มุมมองแผนที่" : "มุมมองตาราง"}
                </FormLabel>
                <Switch
                  id="view-toggle"
                  isChecked={view === "map"}
                  onChange={() => setView(view === "map" ? "table" : "map")}
                  colorScheme="green"
                />
              </FormControl>
            </Flex>

            {/* Tabs */}
            <Tabs
              variant="enclosed"
              index={tabIndex}
              onChange={(index) => setTabIndex(index)}
              isLazy
            >
              <TabList>
                <Tab>เหมืองที่เปิดใช้งาน</Tab>
                <Tab>โซนศักยภาพ</Tab>
                <Tab>โซนเสี่ยง</Tab>
              </TabList>
              <TabPanels>
                <TabPanel p={4}>
                  {view === "map" ? (
                    <Box h="500px" borderRadius="md" overflow="hidden">
                      <MapContainer
                        center={[13.736717, 100.523186]}
                        zoom={6}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {filteredData.map((mine) => (
                          <Marker
                            key={mine.id}
                            position={[mine.location.lat, mine.location.lng]}
                          >
                            <Popup>
                              <Box>
                                <Text fontWeight="bold">{mine.name}</Text>
                                <Text fontSize="sm">แร่: {mine.mineral}</Text>
                                <Text fontSize="sm">
                                  สถานะ:{" "}
                                  {mine.status === "active"
                                    ? "เปิดใช้งาน"
                                    : "ปิดแล้ว"}
                                </Text>
                                <Text fontSize="sm">
                                  เปิดดำเนินการ: {mine.year}
                                </Text>
                              </Box>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </Box>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>ชื่อ</Th>
                            <Th>ประเทศ</Th>
                            <Th>ปี</Th>
                            <Th>แร่</Th>
                            <Th>สถานะ</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                              <Tr key={item.id}>
                                <Td>{item.name}</Td>
                                <Td>
                                  {item.country === "thailand" ? "ไทย" : "ลาว"}
                                </Td>
                                <Td>{item.year}</Td>
                                <Td>
                                  <Badge
                                    colorScheme={
                                      item.mineral === "gold"
                                        ? "yellow"
                                        : item.mineral === "coal"
                                          ? "gray"
                                          : item.mineral === "limestone"
                                            ? "blue"
                                            : "purple"
                                    }
                                  >
                                    {item.mineral === "gold"
                                      ? "ทองคำ"
                                      : item.mineral === "coal"
                                        ? "ถ่านหิน"
                                        : item.mineral === "limestone"
                                          ? "หินปูน"
                                          : item.mineral === "zinc"
                                            ? "สังกะสี"
                                            : item.mineral}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Badge
                                    colorScheme={
                                      item.status === "active" ? "green" : "red"
                                    }
                                  >
                                    {item.status === "active"
                                      ? "เปิดใช้งาน"
                                      : "ปิดแล้ว"}
                                  </Badge>
                                </Td>
                              </Tr>
                            ))
                          ) : (
                            <Tr>
                              <Td colSpan={5} textAlign="center" py={4}>
                                ไม่พบข้อมูลตามเกณฑ์ที่กำหนด
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </TabPanel>
                <TabPanel p={4}>
                  <Box h="500px" borderRadius="md" overflow="hidden">
                    <MapContainer
                      center={[13.736717, 100.523186]}
                      zoom={6}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <GeoJSON
                        data={potentialZonesData}
                        style={potentialZoneStyle}
                      />
                    </MapContainer>
                  </Box>
                </TabPanel>
                <TabPanel p={4}>
                  <Box h="500px" borderRadius="md" overflow="hidden">
                    <MapContainer
                      center={[13.736717, 100.523186]}
                      zoom={6}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <GeoJSON data={riskZonesData} style={riskZoneStyle} />
                    </MapContainer>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        )}
      </Container>
    </Box>
  );
};

export default DataExplorer;
