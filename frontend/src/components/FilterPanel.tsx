import { Stack, Select } from "@chakra-ui/react";

const FilterPanel = () => (
  <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={4}>
    <Select placeholder="ประเทศ">
      <option>ไทย</option>
      <option>ลาว</option>
    </Select>
    <Select placeholder="ปี">
      <option>2024</option>
      <option>2023</option>
    </Select>
    <Select placeholder="แร่">
      <option>ทองคำ</option>
      <option>ถ่านหิน</option>
    </Select>
    <Select placeholder="สถานะ">
      <option>เปิดใช้งาน</option>
      <option>ปิดแล้ว</option>
    </Select>
  </Stack>
);

export default FilterPanel;
