import React from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Checkbox,
  CheckboxGroup,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Badge,
  Button,
  Collapse,
  useDisclosure,
  Divider,
  Tooltip,
  SimpleGrid,
  Textarea,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  InfoOutlineIcon,
} from "@chakra-ui/icons";
import type { AdvancedFilters, EnhancedMineData } from "../types/investigative";

interface AdvancedFilterPanelProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  mineData: EnhancedMineData[];
  onReset: () => void;
}

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  filters,
  onFiltersChange,
  mineData,
  onReset,
}) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  // Get unique values for dropdown options
  const availableCountries = [...new Set(mineData.map((m) => m.country))];
  const availableMinerals = [...new Set(mineData.map((m) => m.mineral))];
  const availableCompanies = [...new Set(mineData.map((m) => m.company))];
  const availableStatuses = [...new Set(mineData.map((m) => m.status))];

  // Get year range from data
  const years = mineData.map((m) => m.year_opened);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const updateFilters = (updates: Partial<AdvancedFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  return (
    <Box
      bg="gray.50"
      p={4}
      borderRadius="lg"
      border="1px"
      borderColor="gray.200"
    >
      <HStack
        justify="space-between"
        mb={4}
        cursor="pointer"
        onClick={onToggle}
      >
        <HStack>
          <Heading size="md">ตัวกรองขั้นสูง</Heading>
          <Badge colorScheme="blue" variant="subtle">
            สำหรับนักข่าวและนักวิจัย
          </Badge>
        </HStack>
        <Button variant="ghost" size="sm">
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button>
      </HStack>

      <Collapse in={isOpen}>
        <VStack spacing={6} align="stretch">
          {/* Advanced Search */}
          <Box>
            <FormControl>
              <HStack mb={2}>
                <FormLabel mb={0}>ค้นหาขั้นสูง</FormLabel>
                <Tooltip
                  label="ใช้ AND, OR สำหรับการค้นหาแบบบูลีน เช่น 'ทองคำ AND อัครา' หรือ 'ถ่านหิน OR แม่เมาะ'"
                  placement="top"
                >
                  <InfoOutlineIcon color="gray.500" />
                </Tooltip>
              </HStack>
              <Textarea
                placeholder="ค้นหาชื่อเหมือง, บริษัท, หรือคำอธิบาย... (รองรับ AND, OR)"
                value={filters.searchQuery}
                onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                rows={2}
              />
            </FormControl>
          </Box>

          <Divider />

          {/* Geographic Filters */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>ประเทศ</FormLabel>
              <Select
                value={filters.country}
                onChange={(e) => updateFilters({ country: e.target.value })}
              >
                <option value="">ทั้งหมด</option>
                {availableCountries.map((country) => (
                  <option key={country} value={country}>
                    {country === "thailand"
                      ? "ไทย"
                      : country === "myanmar"
                        ? "เมียนมาร์"
                        : country === "laos"
                          ? "ลาว"
                          : country}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>บริษัทผู้ดำเนินการ</FormLabel>
              <Select
                value={filters.company}
                onChange={(e) => updateFilters({ company: e.target.value })}
              >
                <option value="">ทั้งหมด</option>
                {availableCompanies.slice(0, 20).map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          {/* Year Range Filter */}
          <Box>
            <FormLabel>
              ช่วงปีที่เปิดดำเนินการ: {filters.yearRange[0]} -{" "}
              {filters.yearRange[1]}
            </FormLabel>
            <RangeSlider
              min={minYear}
              max={maxYear}
              value={filters.yearRange}
              onChange={(values) =>
                updateFilters({ yearRange: values as [number, number] })
              }
              colorScheme="blue"
            >
              <RangeSliderTrack>
                <RangeSliderFilledTrack />
              </RangeSliderTrack>
              <RangeSliderThumb index={0} />
              <RangeSliderThumb index={1} />
            </RangeSlider>
            <HStack justify="space-between" mt={1}>
              <Text fontSize="sm" color="gray.600">
                {minYear}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {maxYear}
              </Text>
            </HStack>
          </Box>

          <Divider />

          {/* Mineral Types */}
          <Box>
            <FormLabel>ประเภทแร่</FormLabel>
            <CheckboxGroup
              value={filters.mineral}
              onChange={(values) =>
                updateFilters({ mineral: values as string[] })
              }
            >
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                {availableMinerals.map((mineral) => (
                  <Checkbox key={mineral} value={mineral}>
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
                  </Checkbox>
                ))}
              </SimpleGrid>
            </CheckboxGroup>
          </Box>

          {/* Mine Status */}
          <Box>
            <FormLabel>สถานะเหมือง</FormLabel>
            <CheckboxGroup
              value={filters.status}
              onChange={(values) =>
                updateFilters({ status: values as string[] })
              }
            >
              <HStack spacing={4}>
                {availableStatuses.map((status) => (
                  <Checkbox key={status} value={status}>
                    {status === "active"
                      ? "เปิดใช้งาน"
                      : status === "closed"
                        ? "ปิดแล้ว"
                        : status === "suspended"
                          ? "ระงับ"
                          : status === "pending"
                            ? "รออนุมัติ"
                            : status}
                  </Checkbox>
                ))}
              </HStack>
            </CheckboxGroup>
          </Box>

          <Divider />

          {/* Risk Assessment Filters */}
          <Box>
            <FormLabel>ระดับความเสี่ยงการปนเปื้อน</FormLabel>
            <CheckboxGroup
              value={filters.contaminationRisk}
              onChange={(values) =>
                updateFilters({ contaminationRisk: values as string[] })
              }
            >
              <HStack spacing={4}>
                <Checkbox value="low">
                  <HStack>
                    <Badge colorScheme="green" size="sm">
                      ต่ำ
                    </Badge>
                  </HStack>
                </Checkbox>
                <Checkbox value="medium">
                  <HStack>
                    <Badge colorScheme="yellow" size="sm">
                      ปานกลาง
                    </Badge>
                  </HStack>
                </Checkbox>
                <Checkbox value="high">
                  <HStack>
                    <Badge colorScheme="orange" size="sm">
                      สูง
                    </Badge>
                  </HStack>
                </Checkbox>
                <Checkbox value="severe">
                  <HStack>
                    <Badge colorScheme="red" size="sm">
                      รุนแรง
                    </Badge>
                  </HStack>
                </Checkbox>
              </HStack>
            </CheckboxGroup>
          </Box>

          {/* Proximity Filters */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <HStack mb={2}>
                <FormLabel mb={0}>ระยะห่างจากแหล่งน้ำ (กม.)</FormLabel>
                <Tooltip label="กรองเหมืองที่อยู่ใกล้แหล่งน้ำในระยะที่กำหนด">
                  <InfoOutlineIcon color="gray.500" />
                </Tooltip>
              </HStack>
              <NumberInput
                min={0}
                max={50}
                value={filters.proximityToWater}
                onChange={(_, value) =>
                  updateFilters({ proximityToWater: value })
                }
              >
                <NumberInputField placeholder="ระยะสูงสุด (กม.)" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl>
              <HStack mb={2}>
                <FormLabel mb={0}>ระยะห่างจากโรงเรียน (กม.)</FormLabel>
                <Tooltip label="กรองเหมืองที่อยู่ใกล้โรงเรียนในระยะที่กำหนด">
                  <InfoOutlineIcon color="gray.500" />
                </Tooltip>
              </HStack>
              <NumberInput
                min={0}
                max={20}
                value={filters.proximityToSchools}
                onChange={(_, value) =>
                  updateFilters({ proximityToSchools: value })
                }
              >
                <NumberInputField placeholder="ระยะสูงสุด (กม.)" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </SimpleGrid>

          {/* Production Range Filter */}
          <Box>
            <FormLabel>ช่วงการผลิต (ตัน/ปี)</FormLabel>
            <HStack spacing={4}>
              <NumberInput
                min={0}
                value={filters.productionRange[0]}
                onChange={(_, value) =>
                  updateFilters({
                    productionRange: [value, filters.productionRange[1]] as [
                      number,
                      number,
                    ],
                  })
                }
              >
                <NumberInputField placeholder="ต่ำสุด" />
              </NumberInput>
              <Text>-</Text>
              <NumberInput
                min={filters.productionRange[0]}
                value={filters.productionRange[1]}
                onChange={(_, value) =>
                  updateFilters({
                    productionRange: [filters.productionRange[0], value] as [
                      number,
                      number,
                    ],
                  })
                }
              >
                <NumberInputField placeholder="สูงสุด" />
              </NumberInput>
            </HStack>
          </Box>

          {/* Action Buttons */}
          <HStack justify="space-between" pt={4}>
            <Button variant="outline" onClick={onReset}>
              ล้างตัวกรอง
            </Button>
            <Badge colorScheme="blue" p={2} borderRadius="md">
              ผลลัพธ์: กำลังกรอง...
            </Badge>
          </HStack>
        </VStack>
      </Collapse>
    </Box>
  );
};

export default AdvancedFilterPanel;
