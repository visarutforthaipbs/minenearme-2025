import React from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Image,
  Button,
  VStack,
  HStack,
  Badge,
  Container,
  Link,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  Divider,
} from "@chakra-ui/react";
import { FaFacebook, FaExternalLinkAlt, FaEnvelope } from "react-icons/fa";

const About = () => (
  <Box className="mining-pattern-hero" minH="100vh">
    <Container maxW="6xl" py={8}>
      {/* Header Section */}
      <VStack spacing={6} align="center" mb={10}>
        <Image
          src="/assets/logos/orange-main.svg"
          alt="MineNearMe Logo"
          height="150px"
        />
        <Heading size="2xl" textAlign="center" color="gray.800">
          เหมืองใกล้ฉัน (MineNearMe)
        </Heading>
        <Badge
          colorScheme="orange"
          fontSize="sm"
          px={4}
          py={2}
          borderRadius="full"
        >
          เวอร์ชัน Beta
        </Badge>
        <Text fontSize="xl" textAlign="center" color="gray.600" maxW="4xl">
          แพลตฟอร์มติดตามผลกระทบจากเหมืองแร่ใกล้บ้านคุณ กรณีศึกษา
          และเข้าใจผลกระทบจากเหมืองแร่อย่างง่าย
        </Text>
      </VStack>

      {/* Beta Notice */}
      <Alert status="info" mb={8} borderRadius="lg">
        <AlertIcon />
        <Box>
          <AlertTitle>โครงการในระยะพัฒนา (Beta Version)</AlertTitle>
          <AlertDescription>
            เหมืองใกล้ฉันยังอยู่ในระยะทดสอบและพัฒนา
            เรายินดีรับฟังข้อเสนอแนะและความคิดเห็นจากผู้ใช้งาน
            เพื่อปรับปรุงแพลตฟอร์มให้ตอบสนองความต้องการของชุมชนและผู้ใช้งานได้ดียิ่งขึ้น
          </AlertDescription>
        </Box>
      </Alert>

      {/* Project Overview */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={10}>
        <Card>
          <CardBody>
            <VStack align="start" spacing={4}>
              <Heading size="lg" color="brand.primary">
                🎯 เป้าหมายของโครงการ
              </Heading>
              <Text>
                สร้างความโปร่งใสและส่งเสริมการมีส่วนร่วมของชุมชนในประเด็นเหมืองแร่
                โดยใช้เทคโนโลยีสารสนเทศภูมิศาสตร์ (GIS)
                และการตรวจสอบแบบเรียลไทม์
              </Text>
              <Text>
                เราเชื่อว่าข้อมูลที่ถูกต้องและเข้าถึงได้ง่าย
                จะช่วยให้ชุมชนสามารถตัดสินใจ
                และเตรียมรับมือกับผลกระทบจากเหมืองแร่ได้อย่างมีประสิทธิภาพ
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="start" spacing={4}>
              <Heading size="lg" color="brand.primary">
                ⚙️ คุณสมบัติหลัก
              </Heading>
              <VStack align="start" spacing={2}>
                <Text>🗺️ แผนที่แสดงที่ตั้งของเหมืองในปัจจุบัน</Text>
                <Text>📊 กรณีศึกษาจากชุมชนที่ได้รับผลกระทบ</Text>
                <Text>📝 ระบบรายงานปัญหาจากชุมชน</Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Partners */}
      <Card mb={10}>
        <CardBody>
          <Heading size="lg" mb={6} color="brand.primary">
            🤝 พันธมิตรและผู้สนับสนุน
          </Heading>
          <Text mb={4} color="gray.600">
            ร่วมมือกับองค์กรต่างๆ เพื่อพัฒนาแพลตฟอร์มให้มีประสิทธิภาพและครอบคลุม
          </Text>
          <HStack spacing={6} flexWrap="wrap" justify="center">
            <Image
              src="/assets/logos/about-icon/1-orange-partner-logo.svg"
              alt="Partner Logo 1"
              height="50px"
              objectFit="contain"
            />
            <Image
              src="/assets/logos/about-icon/4-orange-partner-logo.svg"
              alt="Partner Logo 2"
              height="50px"
              objectFit="contain"
            />
            <Image
              src="/assets/logos/about-icon/Asset 87orange-partner-logo.svg"
              alt="Partner Logo 3"
              height="50px"
              objectFit="contain"
            />
            <Image
              src="/assets/logos/about-icon/Asset 88orange-partner-logo.svg"
              alt="Partner Logo 4"
              height="50px"
              objectFit="contain"
            />
          </HStack>
        </CardBody>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardBody>
          <VStack spacing={6} align="center">
            <Heading size="lg" color="brand.primary">
              📞 ติดต่อเรา
            </Heading>
            <Text textAlign="center" color="gray.600">
              เรายินดีรับฟังข้อเสนอแนะ คำติชม หรือความต้องการใหม่ๆ จากผู้ใช้งาน
              เพื่อพัฒนาแพลตฟอร์มให้ดียิ่งขึ้น
            </Text>

            <VStack spacing={4}>
              <Button
                as={Link}
                href="https://www.facebook.com/profile.php?id=100092195477858"
                target="_blank"
                rel="noopener noreferrer"
                leftIcon={<Icon as={FaFacebook} />}
                rightIcon={<Icon as={FaExternalLinkAlt} />}
                colorScheme="facebook"
                size="lg"
                _hover={{ textDecoration: "none" }}
              >
                ติดต่อผ่าน Facebook
              </Button>

              <Text fontSize="sm" color="gray.500">
                หรือส่งข้อความถึงเราผ่านหน้า Facebook ของโครงการ
              </Text>
            </VStack>

            <Divider my={6} />

            {/* Future Contact Methods */}
            <VStack spacing={2}>
              <Text fontWeight="bold" color="gray.700">
                ช่องทางติดต่ออื่นๆ (เร็วๆ นี้)
              </Text>
              <HStack spacing={4} color="gray.400">
                <HStack>
                  <Icon as={FaEnvelope} />
                  <Text fontSize="sm">อีเมล</Text>
                </HStack>
                <Text>•</Text>
                <Text fontSize="sm">แบบฟอร์มติดต่อ</Text>
                <Text>•</Text>
                <Text fontSize="sm">LINE Official</Text>
              </HStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Footer */}
      <Box textAlign="center" mt={10} py={6}>
        <Text color="gray.500" fontSize="sm">
          เหมืองใกล้ฉัน © 2025 |
          พัฒนาเพื่อส่งเสริมความโปร่งใสและการมีส่วนร่วมของชุมชน
        </Text>
      </Box>
    </Container>
  </Box>
);

export default About;
