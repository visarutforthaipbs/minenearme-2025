import React from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Text,
  Badge,
  VStack,
  HStack,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import type {
  AnalyticsData,
  CrossBorderAnalysis,
} from "../../types/investigative";

interface AnalyticsChartsProps {
  analytics: AnalyticsData;
  crossBorderAnalysis: CrossBorderAnalysis;
  trendData?: {
    openingTrend: Array<{ year: number; count: number }>;
    closingTrend: Array<{ year: number; count: number }>;
    netChange: Array<{ year: number; net: number }>;
    mineralTrends: Record<string, Array<{ year: number; count: number }>>;
  };
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  analytics,
  crossBorderAnalysis,
  trendData,
}) => {
  // Calculate percentages for better insights
  const activePercentage = Math.round(
    (analytics.activeMines / analytics.totalMines) * 100
  );
  const riskPercentage = Math.round(
    (analytics.highRiskMines / analytics.totalMines) * 100
  );
  const waterProximityPercentage = Math.round(
    (analytics.minesNearWater / analytics.totalMines) * 100
  );

  return (
    <VStack spacing={6} align="stretch">
      {/* Executive Summary */}
      <Box bg="gray.50" p={6} borderRadius="lg">
        <Heading size="md" mb={4}>
          สรุปข้อมูลสำคัญ
        </Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>เหมืองทั้งหมด</StatLabel>
            <StatNumber color="blue.600">{analytics.totalMines}</StatNumber>
            <StatHelpText>ฐานข้อมูลปัจจุบัน</StatHelpText>
          </Stat>

          <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>เหมืองที่ใช้งาน</StatLabel>
            <StatNumber color="green.600">{analytics.activeMines}</StatNumber>
            <StatHelpText>{activePercentage}% ของทั้งหมด</StatHelpText>
          </Stat>

          <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>เหมืองเสี่ยงสูง</StatLabel>
            <StatNumber color="red.600">{analytics.highRiskMines}</StatNumber>
            <StatHelpText>{riskPercentage}% ของทั้งหมด</StatHelpText>
          </Stat>

          <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>ใกล้แหล่งน้ำ</StatLabel>
            <StatNumber color="orange.600">
              {analytics.minesNearWater}
            </StatNumber>
            <StatHelpText>{waterProximityPercentage}% ของทั้งหมด</StatHelpText>
          </Stat>
        </SimpleGrid>
      </Box>

      {/* Mineral Distribution */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <Heading size="md" mb={4}>
          การกระจายแร่ตามประเภท
        </Heading>
        <VStack align="stretch" spacing={3}>
          {Object.entries(analytics.minesByMineral)
            .sort(([, a], [, b]) => b - a)
            .map(([mineral, count]) => {
              const percentage = Math.round(
                (count / analytics.totalMines) * 100
              );
              return (
                <Box key={mineral}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontWeight="medium">
                      {mineral === "gold"
                        ? "ทองคำ"
                        : mineral === "coal"
                          ? "ถ่านหิน"
                          : mineral === "limestone"
                            ? "หินปูน"
                            : mineral === "zinc"
                              ? "สังกะสี"
                              : mineral === "tin"
                                ? "ดีบุก"
                                : mineral}
                    </Text>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">
                        {count} เหมือง
                      </Text>
                      <Badge colorScheme="blue">{percentage}%</Badge>
                    </HStack>
                  </HStack>
                  <Progress value={percentage} colorScheme="blue" size="sm" />
                </Box>
              );
            })}
        </VStack>
      </Box>

      {/* Country Distribution */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <Heading size="md" mb={4}>
          การกระจายตามประเทศ
        </Heading>
        <VStack align="stretch" spacing={3}>
          {Object.entries(analytics.minesByCountry)
            .sort(([, a], [, b]) => b - a)
            .map(([country, count]) => {
              const percentage = Math.round(
                (count / analytics.totalMines) * 100
              );
              return (
                <Box key={country}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontWeight="medium">
                      {country === "thailand"
                        ? "ไทย"
                        : country === "myanmar"
                          ? "เมียนมาร์"
                          : country === "laos"
                            ? "ลาว"
                            : country}
                    </Text>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">
                        {count} เหมือง
                      </Text>
                      <Badge colorScheme="green">{percentage}%</Badge>
                    </HStack>
                  </HStack>
                  <Progress value={percentage} colorScheme="green" size="sm" />
                </Box>
              );
            })}
        </VStack>
      </Box>

      {/* Top Companies */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <Heading size="md" mb={4}>
          บริษัทที่มีเหมืองมากที่สุด
        </Heading>
        <VStack align="stretch" spacing={3}>
          {analytics.companiesWithMostMines
            .slice(0, 5)
            .map((company, index) => {
              const percentage = Math.round(
                (company.count / analytics.totalMines) * 100
              );
              return (
                <Box key={company.company}>
                  <HStack justify="space-between" mb={1}>
                    <HStack>
                      <Badge colorScheme="purple" variant="solid">
                        #{index + 1}
                      </Badge>
                      <Text fontWeight="medium" noOfLines={1}>
                        {company.company}
                      </Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">
                        {company.count} เหมือง
                      </Text>
                      <Badge colorScheme="purple">{percentage}%</Badge>
                    </HStack>
                  </HStack>
                  <Progress value={percentage} colorScheme="purple" size="sm" />
                </Box>
              );
            })}
        </VStack>
      </Box>

      {/* Cross-Border Analysis */}
      {crossBorderAnalysis.borderMines.length > 0 && (
        <Box
          bg="orange.50"
          p={6}
          borderRadius="lg"
          border="1px"
          borderColor="orange.200"
        >
          <Heading size="md" mb={4} color="orange.800">
            การวิเคราะห์พื้นที่ชายแดน
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <Stat>
              <StatLabel>เหมืองใกล้ชายแดน</StatLabel>
              <StatNumber color="orange.600">
                {crossBorderAnalysis.borderMines.length}
              </StatNumber>
              <StatHelpText>ระยะห่างน้อยกว่า 50 กม.</StatHelpText>
            </Stat>

            <Stat>
              <StatLabel>ความเสี่ยงข้ามแดน</StatLabel>
              <StatNumber color="red.600">
                {crossBorderAnalysis.transboundaryRisks.length}
              </StatNumber>
              <StatHelpText>เหมืองที่อาจส่งผลข้ามประเทศ</StatHelpText>
            </Stat>
          </SimpleGrid>

          {crossBorderAnalysis.transboundaryRisks.length > 0 && (
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>ความเสี่ยงข้ามแดน!</AlertTitle>
                <AlertDescription>
                  มีเหมือง {crossBorderAnalysis.transboundaryRisks.length} แห่ง
                  ที่อาจส่งผลกระทบข้ามพรมแดน โดยเฉพาะการปนเปื้อนแหล่งน้ำ
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {crossBorderAnalysis.sharedWaterSources.length > 0 && (
            <Box>
              <Text fontWeight="medium" mb={2}>
                แหล่งน้ำที่ใช้ร่วมกัน:
              </Text>
              <VStack align="stretch" spacing={2}>
                {crossBorderAnalysis.sharedWaterSources.map((source, index) => (
                  <Box
                    key={index}
                    bg="white"
                    p={3}
                    borderRadius="md"
                    border="1px"
                    borderColor="orange.300"
                  >
                    <HStack justify="space-between">
                      <Text fontWeight="medium">{source.waterSourceName}</Text>
                      <Badge colorScheme="orange">
                        {source.affectedMines.length} เหมือง
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      ประเทศที่เกี่ยวข้อง:{" "}
                      {source.countries
                        .map((c) =>
                          c === "thailand"
                            ? "ไทย"
                            : c === "myanmar"
                              ? "เมียนมาร์"
                              : c === "laos"
                                ? "ลาว"
                                : c
                        )
                        .join(", ")}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </Box>
      )}

      {/* Timeline Trends (Simplified visualization) */}
      {trendData && (
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>
            แนวโน้มตามช่วงเวลา
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat bg="green.50" p={4} borderRadius="md">
              <StatLabel>เหมืองเปิดใหม่</StatLabel>
              <StatNumber color="green.600">
                {trendData.openingTrend.reduce(
                  (sum, item) => sum + item.count,
                  0
                )}
              </StatNumber>
              <StatHelpText>ทั้งหมดในช่วงเวลาที่เลือก</StatHelpText>
            </Stat>

            <Stat bg="red.50" p={4} borderRadius="md">
              <StatLabel>เหมืองปิด</StatLabel>
              <StatNumber color="red.600">
                {trendData.closingTrend.reduce(
                  (sum, item) => sum + item.count,
                  0
                )}
              </StatNumber>
              <StatHelpText>ทั้งหมดในช่วงเวลาที่เลือก</StatHelpText>
            </Stat>

            <Stat bg="blue.50" p={4} borderRadius="md">
              <StatLabel>การเปลี่ยนแปลงสุทธิ</StatLabel>
              <StatNumber color="blue.600">
                {trendData.netChange.reduce((sum, item) => sum + item.net, 0) >
                0
                  ? "+"
                  : ""}
                {trendData.netChange.reduce((sum, item) => sum + item.net, 0)}
              </StatNumber>
              <StatHelpText>เปิดใหม่ - ปิด</StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>
      )}

      {/* Decade Analysis */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <Heading size="md" mb={4}>
          การกระจายตามทศวรรษ
        </Heading>
        <VStack align="stretch" spacing={3}>
          {Object.entries(analytics.minesByDecade)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([decade, count]) => {
              const percentage = Math.round(
                (count / analytics.totalMines) * 100
              );
              return (
                <Box key={decade}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontWeight="medium">{decade}</Text>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">
                        {count} เหมือง
                      </Text>
                      <Badge colorScheme="teal">{percentage}%</Badge>
                    </HStack>
                  </HStack>
                  <Progress value={percentage} colorScheme="teal" size="sm" />
                </Box>
              );
            })}
        </VStack>
      </Box>
    </VStack>
  );
};

export default AnalyticsCharts;
