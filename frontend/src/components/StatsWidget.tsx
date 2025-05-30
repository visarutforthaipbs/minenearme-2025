import React from "react";
import { Box, Text } from "@chakra-ui/react";

interface StatsWidgetProps {
  active: number;
  potential: number;
  risk: number;
}

const StatsWidget = ({ active, potential, risk }: StatsWidgetProps) => (
  <Box
    className="mining-pattern-subtle"
    bg="whiteAlpha.900"
    p={3}
    borderRadius="lg"
    boxShadow="md"
  >
    <Text fontWeight="bold">🧪 สถิติ</Text>
    <Text>เหมืองที่เปิดใช้งาน: {active}</Text>
    <Text>โซนศักยภาพ: {potential}</Text>
    <Text>โซนเสี่ยง: {risk}</Text>
  </Box>
);

export default StatsWidget;
