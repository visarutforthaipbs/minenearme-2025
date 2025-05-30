import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  Icon,
  Divider,
  SimpleGrid,
  Button,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  Flex,
  Spacer,
  Card,
  CardBody,
  CardHeader,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
} from "@chakra-ui/react";
import {
  ExternalLinkIcon,
  DownloadIcon,
  SearchIcon,
  ChevronRightIcon,
  InfoIcon,
  TimeIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import {
  FaFileAlt,
  FaVideo,
  FaBook,
  FaBalanceScale,
  FaClipboardCheck,
  FaChartLine,
  FaUsers,
  FaLeaf,
  FaGavel,
  FaShieldAlt,
  FaExclamationTriangle,
  FaAward,
  FaPlay,
  FaHeadphones,
  FaMap,
  FaFilter,
  FaClock,
  FaEye,
  FaBookOpen,
  FaGraduationCap,
} from "react-icons/fa";
import {
  learnResources,
  additionalResources,
  categories,
  type LearnResource,
  type AdditionalResource,
  type Category,
} from "../mockData/learnResources";

// Enhanced category icon mapping with colors
const categoryConfig: {
  [key: string]: { icon: React.ComponentType; color: string; bgColor: string };
} = {
  laws: { icon: FaGavel, color: "blue.600", bgColor: "blue.50" },
  eia: { icon: FaClipboardCheck, color: "green.600", bgColor: "green.50" },
  rights: { icon: FaShieldAlt, color: "purple.600", bgColor: "purple.50" },
  impact: { icon: FaExclamationTriangle, color: "red.600", bgColor: "red.50" },
  standards: { icon: FaAward, color: "orange.600", bgColor: "orange.50" },
};

// Resource type icons
const resourceTypeIcons: { [key: string]: React.ComponentType } = {
  pdf: FaFileAlt,
  video: FaPlay,
  audio: FaHeadphones,
  interactive: FaMap,
};

const Learn = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState(0);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Filter resources based on search and category
  const filteredResources = useMemo(() => {
    return learnResources.filter((resource: LearnResource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesCategory =
        selectedCategory === "all" || resource.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Get category statistics
  const categoryStats = useMemo(() => {
    const stats: { [key: string]: number } = {};
    learnResources.forEach((resource: LearnResource) => {
      stats[resource.category] = (stats[resource.category] || 0) + 1;
    });
    return stats;
  }, []);

  const renderResourceIcon = (category: string) => {
    const config = categoryConfig[category] || {
      icon: FaFileAlt,
      color: "gray.600",
      bgColor: "gray.50",
    };
    const IconComponent = config.icon;
    return (
      <Box
        p={2}
        borderRadius="md"
        bg={config.bgColor}
        display="inline-flex"
        mr={3}
      >
        <Icon as={IconComponent} boxSize={5} color={config.color} />
      </Box>
    );
  };

  const renderAdditionalResourceIcon = (type: string) => {
    const IconComponent = resourceTypeIcons[type] || FaFileAlt;
    const colorMap: { [key: string]: string } = {
      video: "red.500",
      audio: "purple.500",
      pdf: "blue.500",
      interactive: "green.500",
    };
    return (
      <Icon
        as={IconComponent}
        boxSize={5}
        color={colorMap[type] || "gray.500"}
      />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box className="mining-pattern-medium" bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={8}>
        {/* Breadcrumb */}
        <Breadcrumb
          spacing="8px"
          separator={<ChevronRightIcon color="gray.500" />}
          mb={6}
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/">หน้าแรก</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>แหล่งความรู้</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Header Section */}
        <Box textAlign="center" mb={10}>
          <Flex justify="center" mb={4}>
            <Icon as={FaGraduationCap} boxSize={12} color="orange.500" />
          </Flex>
          <Heading as="h1" size="2xl" mb={4} color="gray.800">
            แหล่งความรู้เหมืองแร่
          </Heading>
          <Text
            fontSize="xl"
            color="gray.600"
            maxW="3xl"
            mx="auto"
            lineHeight="tall"
          >
            ศูนย์รวมความรู้ด้านกฎหมาย การประเมินผลกระทบสิ่งแวดล้อม สิทธิชุมชน
            และข้อมูลสำคัญเกี่ยวกับอุตสาหกรรมเหมืองแร่ในประเทศไทย
          </Text>
        </Box>

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
          <Stat
            bg={cardBg}
            p={4}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
          >
            <StatLabel>บทความทั้งหมด</StatLabel>
            <StatNumber color="blue.600">{learnResources.length}</StatNumber>
            <StatHelpText>
              <Icon as={FaBookOpen} mr={1} />
              อัพเดทล่าสุด
            </StatHelpText>
          </Stat>
          <Stat
            bg={cardBg}
            p={4}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
          >
            <StatLabel>หมวดหมู่</StatLabel>
            <StatNumber color="green.600">{categories.length}</StatNumber>
            <StatHelpText>
              <Icon as={FaFilter} mr={1} />
              ครอบคลุมทุกด้าน
            </StatHelpText>
          </Stat>
          <Stat
            bg={cardBg}
            p={4}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
          >
            <StatLabel>แหล่งข้อมูลเพิ่มเติม</StatLabel>
            <StatNumber color="purple.600">
              {additionalResources.length}
            </StatNumber>
            <StatHelpText>
              <Icon as={FaEye} mr={1} />
              ไฟล์และวิดีโอ
            </StatHelpText>
          </Stat>
          <Stat
            bg={cardBg}
            p={4}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
          >
            <StatLabel>อัพเดทล่าสุด</StatLabel>
            <StatNumber fontSize="lg" color="orange.600">
              มิ.ย. 2566
            </StatNumber>
            <StatHelpText>
              <Icon as={FaClock} mr={1} />
              ข้อมูลใหม่
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Search and Filter Section */}
        <Card mb={8} bg={cardBg}>
          <CardHeader>
            <Heading size="md">
              <Icon as={SearchIcon} mr={2} />
              ค้นหาและกรองข้อมูล
            </Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4}>
              <GridItem>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="ค้นหาบทความ หัวข้อ หรือแท็ก..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg="white"
                  />
                </InputGroup>
              </GridItem>
              <GridItem>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  bg="white"
                >
                  <option value="all">ทุกหมวดหมู่</option>
                  {categories.map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({categoryStats[category.id] || 0})
                    </option>
                  ))}
                </Select>
              </GridItem>
            </Grid>

            {searchTerm && (
              <Alert status="info" mt={4} borderRadius="md">
                <AlertIcon />
                <AlertTitle>ผลการค้นหา:</AlertTitle>
                <AlertDescription>
                  พบ {filteredResources.length} บทความจากคำค้นหา &ldquo;
                  {searchTerm}&rdquo;
                </AlertDescription>
              </Alert>
            )}
          </CardBody>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          index={activeTab}
          onChange={setActiveTab}
          variant="enclosed"
          colorScheme="orange"
        >
          <TabList mb={6}>
            <Tab>
              <Icon as={FaBook} mr={2} />
              บทความความรู้
            </Tab>
            <Tab>
              <Icon as={FaFileAlt} mr={2} />
              แหล่งข้อมูลเพิ่มเติม
            </Tab>
            <Tab>
              <Icon as={FaUsers} mr={2} />
              หมวดหมู่
            </Tab>
          </TabList>

          <TabPanels>
            {/* Articles Tab */}
            <TabPanel p={0}>
              {filteredResources.length === 0 ? (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertTitle>ไม่พบข้อมูล</AlertTitle>
                  <AlertDescription>
                    ไม่พบบทความที่ตรงกับเงื่อนไขการค้นหา กรุณาลองใช้คำค้นหาอื่น
                  </AlertDescription>
                </Alert>
              ) : (
                <Accordion allowMultiple defaultIndex={[0]}>
                  {filteredResources.map((resource: LearnResource) => (
                    <AccordionItem
                      key={resource.id}
                      mb={4}
                      border="1px"
                      borderColor={borderColor}
                      borderRadius="lg"
                      bg={cardBg}
                      overflow="hidden"
                    >
                      <h2>
                        <AccordionButton py={6} _expanded={{ bg: "orange.50" }}>
                          <Box flex="1" textAlign="left">
                            <Flex align="center" mb={2}>
                              {renderResourceIcon(resource.category)}
                              <VStack align="start" spacing={1} flex={1}>
                                <Heading size="md" color="gray.800">
                                  {resource.title}
                                </Heading>
                                <HStack spacing={2}>
                                  <Badge colorScheme="orange" variant="subtle">
                                    {
                                      categories.find(
                                        (c) => c.id === resource.category
                                      )?.name
                                    }
                                  </Badge>
                                  <Text fontSize="sm" color="gray.500">
                                    <Icon as={TimeIcon} mr={1} />
                                    อัพเดท: {formatDate(resource.lastUpdated)}
                                  </Text>
                                </HStack>
                              </VStack>
                            </Flex>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={6} bg="gray.50">
                        <VStack align="start" spacing={4}>
                          <Text
                            fontStyle="italic"
                            color="gray.600"
                            fontSize="lg"
                          >
                            {resource.summary}
                          </Text>

                          <Divider />

                          <Box>
                            <Heading size="sm" mb={3} color="gray.700">
                              เนื้อหาโดยละเอียด
                            </Heading>
                            <Text whiteSpace="pre-line" lineHeight="tall">
                              {resource.content}
                            </Text>
                          </Box>

                          <Divider />

                          <Grid
                            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                            gap={4}
                            w="full"
                          >
                            <GridItem>
                              <VStack align="start" spacing={2}>
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color="gray.700"
                                >
                                  ข้อมูลเพิ่มเติม
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  <strong>ผู้เขียน:</strong> {resource.author}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  <strong>วันที่เผยแพร่:</strong>{" "}
                                  {formatDate(resource.publishDate)}
                                </Text>
                              </VStack>
                            </GridItem>
                            <GridItem>
                              <VStack align="start" spacing={2}>
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color="gray.700"
                                >
                                  แท็ก
                                </Text>
                                <HStack wrap="wrap" spacing={1}>
                                  {resource.tags.map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      colorScheme="blue"
                                      fontSize="xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </HStack>
                              </VStack>
                            </GridItem>
                          </Grid>

                          {resource.downloadUrl && (
                            <Button
                              rightIcon={<DownloadIcon />}
                              colorScheme="orange"
                              variant="solid"
                              as={Link}
                              href={resource.downloadUrl}
                              isExternal
                              size="lg"
                            >
                              ดาวน์โหลดเอกสารเพิ่มเติม
                            </Button>
                          )}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabPanel>

            {/* Additional Resources Tab */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {additionalResources.map((resource: AdditionalResource) => (
                  <Card
                    key={resource.id}
                    bg={cardBg}
                    _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                    transition="all 0.3s"
                    border="1px"
                    borderColor={borderColor}
                  >
                    <CardHeader pb={2}>
                      <HStack spacing={3}>
                        {renderAdditionalResourceIcon(resource.type)}
                        <VStack align="start" spacing={1} flex={1}>
                          <Heading size="md" noOfLines={2}>
                            {resource.title}
                          </Heading>
                          <Badge
                            colorScheme={
                              resource.type === "video"
                                ? "red"
                                : resource.type === "audio"
                                  ? "purple"
                                  : resource.type === "interactive"
                                    ? "green"
                                    : "blue"
                            }
                            variant="subtle"
                          >
                            {resource.type === "video"
                              ? "วิดีโอ"
                              : resource.type === "audio"
                                ? "เสียง"
                                : resource.type === "interactive"
                                  ? "แบบโต้ตอบ"
                                  : "เอกสาร"}
                          </Badge>
                        </VStack>
                      </HStack>
                    </CardHeader>
                    <CardBody pt={0}>
                      <Text color="gray.600" mb={4} noOfLines={3}>
                        {resource.description}
                      </Text>
                      <Button
                        width="full"
                        colorScheme={
                          resource.type === "video"
                            ? "red"
                            : resource.type === "audio"
                              ? "purple"
                              : resource.type === "interactive"
                                ? "green"
                                : "blue"
                        }
                        rightIcon={
                          resource.type === "video" ||
                          resource.type === "interactive" ? (
                            <ExternalLinkIcon />
                          ) : (
                            <DownloadIcon />
                          )
                        }
                        as={Link}
                        href={resource.url}
                        isExternal
                      >
                        {resource.type === "video"
                          ? "ดูวิดีโอ"
                          : resource.type === "audio"
                            ? "ฟังเสียง"
                            : resource.type === "interactive"
                              ? "เปิดดู"
                              : "ดาวน์โหลด"}
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>

            {/* Categories Tab */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {categories.map((category: Category) => {
                  const config = categoryConfig[category.id] || {
                    icon: FaFileAlt,
                    color: "gray.600",
                    bgColor: "gray.50",
                  };
                  const count = categoryStats[category.id] || 0;
                  return (
                    <Card
                      key={category.id}
                      bg={cardBg}
                      border="1px"
                      borderColor={borderColor}
                      _hover={{ shadow: "lg" }}
                      transition="all 0.3s"
                    >
                      <CardHeader>
                        <HStack spacing={4}>
                          <Box p={3} borderRadius="lg" bg={config.bgColor}>
                            <Icon
                              as={config.icon}
                              boxSize={8}
                              color={config.color}
                            />
                          </Box>
                          <VStack align="start" spacing={1} flex={1}>
                            <Heading size="md">{category.name}</Heading>
                            <Badge colorScheme="orange" variant="subtle">
                              {count} บทความ
                            </Badge>
                          </VStack>
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <Text color="gray.600" mb={4}>
                          {category.description}
                        </Text>
                        <Progress
                          value={(count / learnResources.length) * 100}
                          colorScheme="orange"
                          size="sm"
                          borderRadius="full"
                          mb={2}
                        />
                        <Text fontSize="sm" color="gray.500">
                          {Math.round((count / learnResources.length) * 100)}%
                          ของเนื้อหาทั้งหมด
                        </Text>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Call to Action */}
        <Box
          mt={12}
          textAlign="center"
          p={8}
          bg="orange.50"
          borderRadius="xl"
          border="1px"
          borderColor="orange.200"
        >
          <Icon as={InfoIcon} boxSize={8} color="orange.500" mb={4} />
          <Heading size="lg" mb={4} color="gray.800">
            ต้องการข้อมูลเพิ่มเติม?
          </Heading>
          <Text color="gray.600" mb={6} maxW="2xl" mx="auto">
            หากคุณมีคำถามเกี่ยวกับเนื้อหาหรือต้องการข้อมูลเพิ่มเติม
            สามารถติดต่อหน่วยงานที่เกี่ยวข้องหรือดูข้อมูลเพิ่มเติมได้ที่หน้าอื่นๆ
          </Text>
          <HStack spacing={4} justify="center">
            <Button as={Link} href="/cases" colorScheme="orange" size="lg">
              ดูกรณีศึกษา
            </Button>
            <Button
              as={Link}
              href="/"
              variant="outline"
              colorScheme="orange"
              size="lg"
            >
              ค้นหาเหมืองใกล้ฉัน
            </Button>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Learn;
