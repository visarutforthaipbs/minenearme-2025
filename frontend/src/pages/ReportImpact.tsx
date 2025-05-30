import React, { useState } from "react";
import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  CheckboxGroup,
  Checkbox,
  Button,
  Stack,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormErrorMessage,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  Flex,
  Text,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaCheck, FaClock } from "react-icons/fa";
import { impactReports, responseActions } from "../mockData/reportData";
import {
  submitReport,
  createReportFormData,
  type ReportFormData,
} from "../services/reportApi";

// Fix for Leaflet icon issue in React
// @ts-expect-error - Known issue with leaflet and react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Define types
interface ImpactReport {
  id: number;
  title: string;
  location: {
    lat: number;
    lng: number;
  };
  impactTypes: string[];
  status: string;
  date: string;
  description: string;
  reporter: {
    name: string;
    contact: string;
    verified: boolean;
  };
  evidence: string[];
  responseStatus: string;
  nearbyMines: number[];
}

interface FormData {
  position: { lat: number; lng: number } | null;
  files: FileList | null;
  impactTypes: string[];
  contact: string;
  details: string;
}

interface FormErrors {
  position?: string;
  impactTypes?: string;
  details?: string;
  [key: string]: string | undefined;
}

// Map component with marker selection
interface LocationMarkerProps {
  position: { lat: number; lng: number } | null;
  setPosition: (position: { lat: number; lng: number }) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({
  position,
  setPosition,
}) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position ? <Marker position={position} /> : null;
};

// Report Map component to show all report locations
const ReportsMap = ({ reports }: { reports: ImpactReport[] }) => {
  return (
    <MapContainer
      center={[13.736717, 100.523186]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.location.lat, report.location.lng]}
        >
          <Popup>
            <Box>
              <Text fontWeight="bold">{report.title}</Text>
              <Text fontSize="sm">วันที่: {report.date}</Text>
              <Text fontSize="sm" noOfLines={2}>
                {report.description}
              </Text>
            </Box>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

// Report Status Badge component
interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let color;
  let label;

  switch (status) {
    case "verified":
      color = "green";
      label = "ตรวจสอบแล้ว";
      break;
    case "pending":
      color = "yellow";
      label = "รอตรวจสอบ";
      break;
    case "rejected":
      color = "red";
      label = "ไม่ผ่านการตรวจสอบ";
      break;
    default:
      color = "gray";
      label = status;
  }

  return <Badge colorScheme={color}>{label}</Badge>;
};

// Response Status Badge component
interface ResponseBadgeProps {
  status: string;
}

const ResponseBadge: React.FC<ResponseBadgeProps> = ({ status }) => {
  let color;
  let label;

  switch (status) {
    case "investigating":
      color = "blue";
      label = "กำลังตรวจสอบ";
      break;
    case "addressed":
      color = "green";
      label = "ดำเนินการแล้ว";
      break;
    case "no_action":
      color = "red";
      label = "ไม่มีการดำเนินการ";
      break;
    default:
      color = "gray";
      label = status;
  }

  return <Badge colorScheme={color}>{label}</Badge>;
};

const ReportImpact = () => {
  const toast = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    position: null,
    files: null,
    impactTypes: [],
    contact: "",
    details: "",
  });

  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});

  // Success state
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form changes
  const handleChange = (
    field: string,
    value: string | string[] | FileList | { lat: number; lng: number } | null
  ) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error when field is updated
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };

  // Handle checkbox group changes specifically
  const handleImpactTypesChange = (value: (string | number)[]) => {
    // Convert to string array to ensure type safety
    const stringValues = value.map(String);
    handleChange("impactTypes", stringValues);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.position) {
      newErrors.position = "กรุณาเลือกตำแหน่งบนแผนที่";
    }

    if (formData.impactTypes.length === 0) {
      newErrors.impactTypes = "กรุณาเลือกประเภทผลกระทบอย่างน้อย 1 ประเภท";
    }

    if (!formData.details || formData.details.trim() === "") {
      newErrors.details = "กรุณากรอกรายละเอียดเพิ่มเติม";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data for API submission
      const reportData: ReportFormData = {
        position: formData.position!,
        impactTypes: formData.impactTypes,
        details: formData.details,
        contact: formData.contact,
        files: formData.files,
      };

      // Convert to FormData for multipart upload
      const apiFormData = createReportFormData(reportData);

      // Submit to backend API
      const response = await submitReport(apiFormData);

      if (response.success) {
        setIsSubmitted(true);
        setFormData({
          position: null,
          files: null,
          impactTypes: [],
          contact: "",
          details: "",
        });

        toast({
          title: "ส่งรายงานสำเร็จ",
          description: response.message || "ข้อมูลของคุณถูกส่งเรียบร้อยแล้ว",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Switch to the Reports tab
        setActiveTab(1);
      } else {
        // Handle API errors
        throw new Error(response.message || "Failed to submit report");
      }
    } catch (error: unknown) {
      console.error("Error submitting report:", error);

      let errorMessage = "ไม่สามารถส่งรายงานได้ กรุณาลองใหม่อีกครั้ง";

      // Handle specific API errors
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form after submission
  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      position: null,
      files: null,
      impactTypes: [],
      contact: "",
      details: "",
    });
    setErrors({});
    setActiveTab(0);
  };

  // Find response actions for a report
  const findResponseActions = (reportId: number) => {
    return responseActions.find((response) => response.reportId === reportId);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6} textAlign="center">
        ระบบรายงานผลกระทบ
      </Heading>
      <Text textAlign="center" mb={8} fontSize="lg">
        รายงานผลกระทบจากการทำเหมืองแร่ในพื้นที่ของคุณ
        และติดตามการดำเนินการตรวจสอบและแก้ไข
      </Text>

      <Tabs
        isFitted
        variant="enclosed"
        index={activeTab}
        onChange={setActiveTab}
      >
        <TabList mb="1em">
          <Tab _selected={{ color: "white", bg: "green.500" }}>
            แจ้งรายงานใหม่
          </Tab>
          <Tab _selected={{ color: "white", bg: "blue.500" }}>
            รายงานที่ส่งแล้ว
          </Tab>
          <Tab _selected={{ color: "white", bg: "orange.500" }}>
            แผนที่รายงาน
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {isSubmitted ? (
              <Alert
                status="success"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="200px"
                borderRadius="md"
              >
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  ขอบคุณสำหรับข้อมูลของคุณ
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                  ข้อมูลของคุณถูกส่งเรียบร้อยแล้ว เราจะตรวจสอบและดำเนินการต่อไป
                </AlertDescription>
                <Button mt={4} colorScheme="green" onClick={handleReset}>
                  รายงานเพิ่มเติม
                </Button>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                <FormControl mb={4} isInvalid={!!errors.position}>
                  <FormLabel>เลือกตำแหน่งบนแผนที่</FormLabel>
                  <Box h="300px" borderRadius="md" mb={2} overflow="hidden">
                    <MapContainer
                      center={[13.736717, 100.523186]}
                      zoom={6}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker
                        position={formData.position}
                        setPosition={(pos) => handleChange("position", pos)}
                      />
                    </MapContainer>
                  </Box>
                  {formData.position && (
                    <Box fontSize="sm" color="gray.600" mb={2}>
                      ตำแหน่งที่เลือก: {formData.position.lat.toFixed(6)},{" "}
                      {formData.position.lng.toFixed(6)}
                    </Box>
                  )}
                  {errors.position && (
                    <FormErrorMessage>{errors.position}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>อัปโหลดไฟล์ (รูปภาพหรือวิดีโอ)</FormLabel>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => handleChange("files", e.target.files)}
                    accept="image/*,video/*"
                  />
                </FormControl>

                <FormControl mb={4} isInvalid={!!errors.impactTypes}>
                  <FormLabel>ประเภทผลกระทบ</FormLabel>
                  <CheckboxGroup
                    value={formData.impactTypes}
                    onChange={handleImpactTypesChange}
                  >
                    <Stack>
                      <Checkbox value="environment">สิ่งแวดล้อม</Checkbox>
                      <Checkbox value="health">สุขภาพ</Checkbox>
                      <Checkbox value="economic">เศรษฐกิจ</Checkbox>
                      <Checkbox value="other">อื่น ๆ</Checkbox>
                    </Stack>
                  </CheckboxGroup>
                  {errors.impactTypes && (
                    <FormErrorMessage>{errors.impactTypes}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>ข้อมูลติดต่อ (ไม่บังคับ)</FormLabel>
                  <Input
                    placeholder="ชื่อ/อีเมล/เบอร์โทร"
                    value={formData.contact}
                    onChange={(e) => handleChange("contact", e.target.value)}
                  />
                </FormControl>

                <FormControl mb={4} isInvalid={!!errors.details}>
                  <FormLabel>รายละเอียดเพิ่มเติม</FormLabel>
                  <Textarea
                    rows={3}
                    value={formData.details}
                    onChange={(e) => handleChange("details", e.target.value)}
                    placeholder="อธิบายผลกระทบที่พบ..."
                  />
                  {errors.details && (
                    <FormErrorMessage>{errors.details}</FormErrorMessage>
                  )}
                </FormControl>

                <Button
                  colorScheme="green"
                  size="lg"
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="กำลังส่งข้อมูล..."
                  width="full"
                >
                  ส่งรายงาน
                </Button>
              </form>
            )}
          </TabPanel>

          <TabPanel>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={6}
            >
              {impactReports.map((report) => (
                <Box
                  key={report.id}
                  p={5}
                  boxShadow="md"
                  borderRadius="lg"
                  bg="white"
                  _hover={{ shadow: "lg" }}
                  transition="all 0.3s"
                >
                  <Flex justify="space-between" align="center" mb={3}>
                    <Heading size="md">{report.title}</Heading>
                    <StatusBadge status={report.status} />
                  </Flex>

                  <Text color="gray.600" mb={2}>
                    วันที่: {report.date}
                  </Text>

                  <Text mb={3}>{report.description}</Text>

                  <Flex wrap="wrap" mb={3}>
                    {report.impactTypes.map((type, index) => (
                      <Badge key={index} colorScheme="orange" mr={2} mb={2}>
                        {type === "environment" && "สิ่งแวดล้อม"}
                        {type === "health" && "สุขภาพ"}
                        {type === "economic" && "เศรษฐกิจ"}
                        {type === "other" && "อื่นๆ"}
                      </Badge>
                    ))}
                  </Flex>

                  <Divider mb={3} />

                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold">สถานะการตอบสนอง:</Text>
                    <ResponseBadge status={report.responseStatus} />
                  </Flex>

                  {findResponseActions(report.id) && (
                    <Accordion allowToggle mt={3}>
                      <AccordionItem border="none">
                        <AccordionButton
                          _expanded={{ bg: "blue.50" }}
                          p={2}
                          borderRadius="md"
                        >
                          <Box flex="1" textAlign="left">
                            ดูการดำเนินการ
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <List spacing={2}>
                            {findResponseActions(report.id)?.actions.map(
                              (action, index) => (
                                <ListItem key={index}>
                                  <Flex align="center">
                                    <ListIcon
                                      as={
                                        action.status === "completed"
                                          ? FaCheck
                                          : FaClock
                                      }
                                      color={
                                        action.status === "completed"
                                          ? "green.500"
                                          : "orange.500"
                                      }
                                    />
                                    <Box>
                                      <Text fontWeight="bold">
                                        {action.action}
                                      </Text>
                                      <Text fontSize="sm">
                                        โดย: {action.actor} ({action.date})
                                      </Text>
                                    </Box>
                                  </Flex>
                                </ListItem>
                              )
                            )}
                          </List>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  )}
                </Box>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel>
            <Box height="500px" borderRadius="md" overflow="hidden">
              <ReportsMap reports={impactReports} />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default ReportImpact;
