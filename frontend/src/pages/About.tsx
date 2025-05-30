import React from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Image,
  FormControl,
  FormLabel,
  Input,
  Button,
  Textarea,
} from "@chakra-ui/react";

const About = () => (
  <Box className="mining-pattern-hero" p={6} minH="100vh">
    <Heading mb={6}>เกี่ยวกับเรา</Heading>
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
      <Box>
        <Heading size="md" mb={2}>
          พันธกิจ
        </Heading>
        <p>สร้างความโปร่งใสและการมีส่วนร่วมของชุมชนในประเด็นเหมืองแร่</p>
      </Box>
      <Box>
        <Heading size="md" mb={2}>
          พันธมิตร
        </Heading>
        <Image
          src="/assets/partner1.png"
          alt="Partner 1"
          h="40px"
          mr={2}
          display="inline-block"
        />
        <Image
          src="/assets/partner2.png"
          alt="Partner 2"
          h="40px"
          display="inline-block"
        />
      </Box>
    </SimpleGrid>
    <Box mb={6}>
      <Heading size="md" mb={2}>
        ติดต่อเรา
      </Heading>
      <form>
        <FormControl mb={2}>
          <FormLabel>ชื่อ</FormLabel>
          <Input />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>อีเมล</FormLabel>
          <Input type="email" />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>ข้อความ</FormLabel>
          <Textarea rows={3} />
        </FormControl>
        <Button colorScheme="green" type="submit">
          ส่งข้อความ
        </Button>
      </form>
    </Box>
    <Button colorScheme="orange">ดาวน์โหลด Media Kit</Button>
  </Box>
);

export default About;
