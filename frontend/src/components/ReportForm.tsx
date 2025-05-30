import React from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  CheckboxGroup,
  Checkbox,
  Button,
  Stack,
  Textarea,
} from "@chakra-ui/react";

const ReportForm = () => (
  <form>
    <FormControl mb={4}>
      <FormLabel>เลือกตำแหน่งบนแผนที่</FormLabel>
      <Box
        className="mining-pattern-subtle"
        h="200px"
        bg="gray.100"
        borderRadius="md"
        mb={2}
      />
      <Button size="sm">📍 เลือกตำแหน่ง</Button>
    </FormControl>
    <FormControl mb={4}>
      <FormLabel>อัปโหลดไฟล์</FormLabel>
      <Input type="file" multiple />
    </FormControl>
    <FormControl mb={4}>
      <FormLabel>ประเภทผลกระทบ</FormLabel>
      <CheckboxGroup>
        <Stack>
          <Checkbox>สิ่งแวดล้อม</Checkbox>
          <Checkbox>สุขภาพ</Checkbox>
          <Checkbox>เศรษฐกิจ</Checkbox>
          <Checkbox>อื่น ๆ</Checkbox>
        </Stack>
      </CheckboxGroup>
    </FormControl>
    <FormControl mb={4}>
      <FormLabel>ข้อมูลติดต่อ (ไม่บังคับ)</FormLabel>
      <Input placeholder="ชื่อ/อีเมล/เบอร์โทร" />
    </FormControl>
    <FormControl mb={4}>
      <FormLabel>รายละเอียดเพิ่มเติม</FormLabel>
      <Textarea rows={3} />
    </FormControl>
    <Button colorScheme="green" type="submit">
      ส่งรายงาน
    </Button>
  </form>
);

export default ReportForm;
