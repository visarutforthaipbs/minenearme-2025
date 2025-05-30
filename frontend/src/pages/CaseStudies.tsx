import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardFooter,
  Image,
  Stack,
  Button,
  Badge,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { caseStudies } from "../data/caseData";

const CaseStudies = () => {
  // Sort cases to put case-6 (active case) first
  const sortedCases = [...caseStudies].sort((a, b) => {
    if (a.id === "case-6") return -1;
    if (b.id === "case-6") return 1;
    return 0;
  });

  return (
    <Box className="mining-pattern-medium" minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack align="stretch" spacing={8}>
          <Box>
            <Heading size="2xl" mb={4}>
              กรณีศึกษา
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="container.md">
              รวบรวมกรณีศึกษาผลกระทบจากเหมืองแร่ทั่วประเทศไทย
              ติดตามสถานการณ์และการแก้ไขปัญหาในพื้นที่ต่างๆ
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {sortedCases.map((caseItem) => {
              const isReady = caseItem.id === "case-6";

              return (
                <Card
                  key={caseItem.id}
                  className="mining-pattern-card"
                  overflow="hidden"
                  variant="outline"
                  opacity={isReady ? 1 : 0.7}
                  border={isReady ? "1px solid" : "1px dashed"}
                  borderColor={isReady ? "gray.200" : "gray.400"}
                >
                  <Box position="relative" height="200px">
                    <Image
                      src={caseItem.heroImage}
                      alt={caseItem.title}
                      height="100%"
                      width="100%"
                      objectFit="cover"
                      filter={isReady ? "none" : "grayscale(0.8)"}
                    />
                    {!isReady && (
                      <Badge
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="gray"
                        fontSize="sm"
                        px={2}
                      >
                        เร็วๆ นี้
                      </Badge>
                    )}
                  </Box>
                  <CardBody>
                    <Stack spacing={3}>
                      <HStack>
                        <Badge colorScheme="blue">ปี {caseItem.year}</Badge>
                        {caseItem.tags?.slice(0, 2).map((tag, i) => (
                          <Badge
                            key={i}
                            colorScheme={isReady ? "green" : "gray"}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </HStack>
                      <Heading
                        size="md"
                        color={isReady ? "inherit" : "gray.500"}
                      >
                        {caseItem.title}
                      </Heading>
                      <Text
                        noOfLines={2}
                        color={isReady ? "inherit" : "gray.500"}
                      >
                        กรณีศึกษาผลกระทบจากการทำเหมืองในพื้นที่
                        ติดตามสถานการณ์ล่าสุด การแก้ไขปัญหา
                        และความเคลื่อนไหวของชุมชน
                      </Text>
                    </Stack>
                  </CardBody>
                  <CardFooter>
                    {isReady ? (
                      <Button
                        as={RouterLink}
                        to={`/cases/${caseItem.id}`}
                        colorScheme="blue"
                        width="full"
                      >
                        ดูรายละเอียด
                      </Button>
                    ) : (
                      <Button
                        isDisabled
                        colorScheme="gray"
                        width="full"
                        cursor="not-allowed"
                      >
                        อยู่ระหว่างเตรียมข้อมูล
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default CaseStudies;
