import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Divider,
  Button,
  Icon,
  Flex,
  CloseButton,
  useColorModeValue,
  List,
  ListItem,
  Spinner,
  Badge,
  Image,
} from "@chakra-ui/react";
import {
  FaMapMarkedAlt,
  FaArrowLeft,
  FaExclamationTriangle,
} from "react-icons/fa";
import type { Feature } from "geojson";
import { useParams } from "react-router-dom";

// Export interface for use in other components
export interface MineListItem {
  id: string | number;
  name: string;
  distance?: number; // in kilometers
  feature: Feature;
}

interface DetailSidebarProps {
  selectedFeature: Feature | null;
  onClose: () => void;
  nearbyMines?: MineListItem[];
  isLoadingNearby?: boolean;
  onMineSelect?: (feature: Feature) => void;
  onBackToList?: () => void;
  isVisible?: boolean; // Add visibility control
}

const DetailSidebar: React.FC<DetailSidebarProps> = ({
  selectedFeature,
  onClose,
  nearbyMines = [],
  isLoadingNearby = false,
  onMineSelect,
  onBackToList,
  isVisible = true, // Default to visible for backward compatibility
}) => {
  // Adapt background for light/dark mode
  const bg = useColorModeValue("white", "gray.800");
  const highlightBg = useColorModeValue("gray.50", "gray.700");
  const { id: caseId } = useParams<{ id: string }>();

  // State for holding at-risk villages data
  const [atRiskVillages, setAtRiskVillages] = useState<Feature[]>([]);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);

  // Fetch village risk data for Case 6
  useEffect(() => {
    if (caseId === "case-6" && selectedFeature) {
      setIsLoadingVillages(true);
      fetch(
        `${window.location.origin}/assets/data/case6/case-6-village-risk.geojson`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data && data.features) {
            setAtRiskVillages(data.features);
          }
          setIsLoadingVillages(false);
        })
        .catch((error) => {
          console.error("Error loading village risk data:", error);
          setIsLoadingVillages(false);
        });
    }
  }, [caseId, selectedFeature]);

  // Determine if we're in detail view or list view
  const isDetailView = !!selectedFeature;

  // Determine if we should show the sidebar
  const shouldShow =
    isVisible && (isDetailView || nearbyMines.length > 0 || isLoadingNearby);

  // Don't render anything if not visible on mobile, but always show on desktop
  if (!shouldShow) {
    return null;
  }

  // Normalize properties for detail view with updated path keys
  const p = selectedFeature?.properties || {};
  const sidebarData = selectedFeature
    ? {
        // id: Thai="REQ_CONCESSION_ID" or "ROW_ID", Myanmar="o_id"
        id:
          p["dpimgisdb.gisdpim.vw_b_concession.REQ_CONCESSION_ID"] ||
          p.ROW_ID ||
          p.o_id ||
          "-",

        // name: Thai="ADVS_FIELD1", Myanmar="o_nmME"
        name:
          p["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD1"] ||
          p.o_nmME ||
          "ไม่ระบุชื่อ",

        // permitNumber: Thai="PERMIT_ID", Myanmar="PermitNo"
        permitNumber:
          p["dpimgisdb.GISDPIM.MINING_PERMIT.PERMIT_ID"] ||
          p.PermitNo ||
          p[" permitNumber"] || // Added for case-6-eastern-shan-mining.geojson
          "ไม่ระบุ",

        // mineral: Thai="ADVS_FIELD4", Myanmar="Commodity"
        mineral:
          p["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD4"] ||
          p.Commodity ||
          p.mineral || // Added for case-6-eastern-shan-mining.geojson
          "ไม่ระบุ",

        // operator: Thai="ADVS_FIELD2", Myanmar="LicHolder"
        operator:
          p["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD2"] ||
          p.LicHolder ||
          p.operator || // Added for case-6-eastern-shan-mining.geojson
          "ไม่ระบุ",

        // status: Thai="ADVS_FIELD5", Myanmar="KindActiv"
        status:
          p["dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD5"] ||
          p.KindActiv ||
          p.status || // Added for case-6-eastern-shan-mining.geojson
          "ไม่ระบุ",

        // issueDate: Thai="APPROVE_DT", Myanmar="DateAward"
        issueDate:
          p["dpimgisdb.gisdpim.vw_b_concession.APPROVE_DT"] ||
          p.DateAward ||
          p.issueDate || // Added for case-6-eastern-shan-mining.geojson
          "ไม่ระบุ",

        // activeDate: same as issueDate (APPROVE_DT or DateAward)
        activeDate:
          p["dpimgisdb.gisdpim.vw_b_concession.APPROVE_DT"] ||
          p.DateAward ||
          p.issueDate || // Added for case-6-eastern-shan-mining.geojson
          "ไม่ระบุ",

        // expireDate: Thai="EXPIRE_DT", Myanmar="DateExpiry"
        expireDate:
          p["dpimgisdb.gisdpim.vw_b_concession.EXPIRE_DT"] ||
          p.DateExp ||
          p.expireDate || // Added for case-6-eastern-shan-mining.geojson
          "ไม่ระบุ",

        // area: only Myanmar layer has it ("POLY_AREA" or "Area")
        area: p.POLY_AREA || p.Area || p.polyArea || "-",
      }
    : null;

  // Get risk color for badge
  const getRiskColor = (riskLevel: string | number) => {
    if (typeof riskLevel === "string") {
      switch (riskLevel.toLowerCase()) {
        case "high":
          return "red";
        case "medium":
          return "orange";
        case "low":
          return "yellow";
        default:
          return "gray";
      }
    } else if (typeof riskLevel === "number") {
      if (riskLevel >= 3) return "red";
      if (riskLevel >= 2) return "orange";
      if (riskLevel >= 1) return "yellow";
      return "gray";
    }
    return "gray";
  };

  // Get risk label
  const getRiskLabel = (riskLevel: string | number) => {
    if (typeof riskLevel === "string") {
      switch (riskLevel.toLowerCase()) {
        case "high":
          return "สูง";
        case "medium":
          return "ปานกลาง";
        case "low":
          return "ต่ำ";
        default:
          return "ไม่ระบุ";
      }
    } else if (typeof riskLevel === "number") {
      if (riskLevel >= 3) return "สูง";
      if (riskLevel >= 2) return "ปานกลาง";
      if (riskLevel >= 1) return "ต่ำ";
      return "ไม่ระบุ";
    }
    return "ไม่ระบุ";
  };

  return (
    <>
      {/* Mobile Overlay */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        zIndex={999}
        display={shouldShow ? ["block", "block", "none"] : "none"}
        onClick={onClose}
      />

      <Box
        position={["fixed", "fixed", "absolute"]}
        right={0}
        top={["auto", "auto", 0]}
        bottom={0}
        left={["0", "0", "auto"]}
        width={["100%", "100%", "350px"]}
        height={["60vh", "70vh", "100%"]}
        maxHeight={["60vh", "70vh", "100%"]}
        bg={bg}
        boxShadow={[
          "0 -4px 10px rgba(0, 0, 0, 0.1)",
          "0 -4px 10px rgba(0, 0, 0, 0.1)",
          "-4px 0 10px rgba(0, 0, 0, 0.1)",
        ]}
        overflowY="auto"
        zIndex={1000}
        transition="all 0.3s"
        className="mining-pattern-subtle"
        borderTopRadius={[8, 8, 0]}
        transform={[
          shouldShow ? "translateY(0)" : "translateY(100%)",
          shouldShow ? "translateY(0)" : "translateY(100%)",
          "translateY(0)",
        ]}
      >
        {/* Header with Title */}
        <Flex
          justify="space-between"
          align="center"
          p={4}
          borderBottomWidth="1px"
          position="sticky"
          top={0}
          bg={bg}
          zIndex={1}
        >
          <Heading size="md" display="flex" alignItems="center">
            {isDetailView && onBackToList ? (
              <Button
                leftIcon={<FaArrowLeft />}
                variant="ghost"
                size="sm"
                mr={2}
                onClick={onBackToList}
              />
            ) : null}
            <Icon as={FaMapMarkedAlt} mr={2} color="orange.500" />
            {isDetailView ? "รายละเอียดเหมือง" : "เหมืองแร่ไทยและพม่า"}
          </Heading>
          <CloseButton
            onClick={onClose}
            size="lg"
            display={["block", "block", "none"]}
          />
        </Flex>

        {isDetailView ? (
          // Detail View with updated properties
          <>
            {/* Core Mine Info */}
            <VStack align="start" spacing={2} p={4}>
              <Text fontSize="lg" fontWeight="bold">
                {sidebarData?.name}
              </Text>
              <Text>เลขที่สัมปทาน: {sidebarData?.permitNumber}</Text>
              <Text>ประเภทแร่: {sidebarData?.mineral}</Text>
              <Text>ผู้รับสัมปทาน: {sidebarData?.operator}</Text>
              <Text>สถานะ: {sidebarData?.status}</Text>
              <Text>วันที่อนุมัติ: {sidebarData?.issueDate}</Text>
              <Text>วันเริ่ม: {sidebarData?.activeDate}</Text>
              <Text>วันหมดอายุ: {sidebarData?.expireDate}</Text>
              <Text>ขนาดพื้นที่: {sidebarData?.area}</Text>
              <Text fontSize="xs" color="gray.500">
                ID: {sidebarData?.id}
              </Text>
            </VStack>

            {/* Show villages at risk for Case 6 */}
            {caseId === "case-6" && (
              <>
                <Divider my={4} />
                <VStack align="start" p={4}>
                  <Flex alignItems="center" mb={2}>
                    <Icon
                      as={FaExclamationTriangle}
                      color="orange.500"
                      mr={2}
                    />
                    <Heading size="sm">หมู่บ้านที่อาจได้รับผลกระทบ</Heading>
                  </Flex>

                  {isLoadingVillages ? (
                    <Spinner size="sm" color="orange.500" />
                  ) : atRiskVillages.length > 0 ? (
                    <List spacing={2} w="100%">
                      {atRiskVillages.map((village, index) => {
                        const villageName =
                          village.properties?.VILLAGE_T ||
                          village.properties?.VILLAGE ||
                          `หมู่บ้าน ${index + 1}`;
                        const riskLevel = village.properties?.riskLevel;

                        return (
                          <ListItem
                            key={index}
                            p={2}
                            borderRadius="md"
                            bg={highlightBg}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Text fontSize="sm">{villageName}</Text>
                            <Badge colorScheme={getRiskColor(riskLevel)}>
                              {getRiskLabel(riskLevel)}
                            </Badge>
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : (
                    <Text fontSize="sm">
                      ไม่พบข้อมูลหมู่บ้านที่ได้รับผลกระทบ
                    </Text>
                  )}
                </VStack>
              </>
            )}

            <Divider my={4} />

            {/* Actions */}
            <VStack spacing={3} p={4}>
              <Button
                colorScheme="gray"
                width="full"
                variant="outline"
                isDisabled={true}
                cursor="not-allowed"
                opacity={0.6}
              >
                รายงานผลกระทบ (เร็วๆ นี้)
              </Button>
              <Button
                colorScheme="gray"
                width="full"
                variant="outline"
                isDisabled={true}
                cursor="not-allowed"
                opacity={0.6}
              >
                ดูรายละเอียดเพิ่มเติม (เร็วๆ นี้)
              </Button>
            </VStack>
          </>
        ) : (
          // List View
          <Box p={3}>
            {isLoadingNearby ? (
              <Flex direction="column" align="center" justify="center" py={10}>
                <Spinner size="xl" color="orange.500" mb={4} />
                <Text>กำลังค้นหาเหมืองในบริเวณใกล้คุณ...</Text>
              </Flex>
            ) : nearbyMines.length > 0 ? (
              <>
                <Text fontSize="sm" mb={3} fontWeight="bold">
                  พบเหมือง {nearbyMines.length} แห่ง ในระยะ 30 กิโลเมตร
                </Text>
                <List spacing={2}>
                  {nearbyMines.map((mine) => (
                    <ListItem
                      key={mine.id}
                      p={3}
                      borderRadius="md"
                      bg={highlightBg}
                      cursor="pointer"
                      _hover={{ bg: "orange.50" }}
                      onClick={() => onMineSelect?.(mine.feature)}
                    >
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="bold">
                          {mine.name || "ไม่ระบุชื่อ"}
                        </Text>
                        {mine.distance !== undefined && (
                          <Badge colorScheme="orange">
                            {mine.distance.toFixed(1)} กม.
                          </Badge>
                        )}
                      </Flex>
                      <Text fontSize="sm" color="gray.600">
                        {mine.feature.properties?.Commodity ||
                          mine.feature.properties?.[
                            "dpimgisdb.gisdpim.vw_b_concession.ADVS_FIELD4"
                          ] ||
                          "ไม่ระบุแร่"}
                      </Text>
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <Flex direction="column" align="center" justify="center" py={10}>
                <Image
                  src="/assets/logos/sidebar-logo.gif"
                  alt="Mine Near Me Logo"
                  boxSize="120px"
                  mb={4}
                />
                <Text fontWeight="bold" mb={2}>
                  คลิกปุ่ม &quot;ค้นหาเหมืองใกล้ฉัน&quot;
                </Text>
                <Text textAlign="center" color="gray.500">
                  เพื่อค้นหาเหมืองในระยะ 30 กิโลเมตรจากตำแหน่งปัจจุบันของคุณ
                </Text>
              </Flex>
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export default DetailSidebar;
