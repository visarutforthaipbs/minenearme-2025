import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Flex,
  useColorModeValue,
  Progress,
  HStack,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import {
  FaCalendarAlt,
  FaExclamationTriangle,
  FaFlask,
  FaUsers,
  FaFileAlt,
  FaGavel,
  FaExternalLinkAlt,
} from "react-icons/fa";
import type { Swiper as SwiperType } from "swiper";
// @ts-expect-error - No type definitions available
import "swiper/css";
// @ts-expect-error - No type definitions available
import "swiper/css/navigation";
// @ts-expect-error - No type definitions available
import "swiper/css/pagination";
import "./timelineCarousel.css";

// Event types and their corresponding icons
const eventTypeIcons: Record<string, React.ElementType> = {
  discovery: FaExclamationTriangle,
  report: FaFileAlt,
  protest: FaUsers,
  legal: FaGavel,
  scientific: FaFlask,
  default: FaCalendarAlt,
};

// Helper function to get year from date string
const getYearFromDate = (dateString: string): number => {
  return new Date(dateString).getFullYear();
};

// Helper function to determine event type based on title keywords
const getEventType = (title: string): string => {
  const titleLower = title.toLowerCase();

  if (
    titleLower.includes("พบ") ||
    titleLower.includes("ปนเปื้อน") ||
    titleLower.includes("ตรวจ")
  ) {
    return "discovery";
  } else if (titleLower.includes("รายงาน") || titleLower.includes("ผล")) {
    return "report";
  } else if (titleLower.includes("ประท้วง") || titleLower.includes("ชุมชน")) {
    return "protest";
  } else if (
    titleLower.includes("คำสั่ง") ||
    titleLower.includes("ระงับ") ||
    titleLower.includes("กระทรวง")
  ) {
    return "legal";
  } else if (titleLower.includes("ตรวจสอบ") || titleLower.includes("ทดสอบ")) {
    return "scientific";
  } else {
    return "default";
  }
};

// Helper function to format dates in Thai
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  source?: string;
}

interface TimelineCarouselProps {
  events: TimelineEvent[];
  onEventSelect?: (event: TimelineEvent, index: number) => void;
}

const TimelineCarousel: React.FC<TimelineCarouselProps> = ({
  events = [],
  onEventSelect,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [yearGroups, setYearGroups] = useState<Record<number, TimelineEvent[]>>(
    {}
  );

  // Background and border colors based on theme
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const activeCardBg = useColorModeValue("blue.50", "blue.900");
  const progressColorScheme = useColorModeValue("blue", "teal");

  // Log the events for debugging
  useEffect(() => {
    console.log("TimelineCarousel received events:", events);
  }, [events]);

  // Group events by year
  useEffect(() => {
    if (!events || events.length === 0) {
      console.log("No timeline events to display");
      return;
    }

    const groups: Record<number, TimelineEvent[]> = {};

    events.forEach((event) => {
      try {
        const year = getYearFromDate(event.date);
        if (!groups[year]) {
          groups[year] = [];
        }
        groups[year].push(event);
      } catch (err) {
        console.error("Error processing event:", event, err);
      }
    });

    setYearGroups(groups);
  }, [events]);

  // Update progress when active index changes
  useEffect(() => {
    if (events.length === 0) {
      setProgress(0);
      return;
    }

    const newProgress = ((activeIndex + 1) / events.length) * 100;
    setProgress(newProgress);

    // Call onEventSelect if provided
    if (onEventSelect && events[activeIndex]) {
      onEventSelect(events[activeIndex], activeIndex);
    }
  }, [activeIndex, events, onEventSelect]);

  // Handler for slide change
  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  };

  // Handler for source link click
  const handleSourceClick = (e: React.MouseEvent, sourceUrl: string) => {
    e.stopPropagation(); // Prevent card click event
    window.open(sourceUrl, "_blank", "noopener,noreferrer");
  };

  // Render year headers
  const renderYearHeaders = () => {
    return Object.keys(yearGroups)
      .sort((a, b) => Number(a) - Number(b))
      .map((year) => (
        <Box
          key={year}
          px={4}
          py={2}
          bg="gray.100"
          color="gray.700"
          fontWeight="bold"
          borderRadius="md"
        >
          {year}
        </Box>
      ));
  };

  // If no events, display a message
  if (!events || events.length === 0) {
    return (
      <Box
        p={6}
        textAlign="center"
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
      >
        <Text>ยังไม่มีข้อมูลลำดับเหตุการณ์</Text>
      </Box>
    );
  }

  return (
    <Box w="100%">
      {/* Year markers */}
      <HStack mb={4} spacing={4} overflowX="auto" pb={2}>
        {renderYearHeaders()}
      </HStack>

      {/* Progress bar */}
      <Progress
        value={progress}
        size="sm"
        colorScheme={progressColorScheme}
        mb={4}
        borderRadius="full"
      />

      {/* Timeline carousel */}
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView="auto"
        centeredSlides={false}
        onSlideChange={handleSlideChange}
        breakpoints={{
          // when window width is >= 320px
          320: {
            slidesPerView: 1,
          },
          // when window width is >= 640px
          640: {
            slidesPerView: 2,
          },
          // when window width is >= 768px
          768: {
            slidesPerView: 3,
          },
          // when window width is >= 1024px
          1024: {
            slidesPerView: 4,
          },
        }}
        className="timeline-swiper"
      >
        {events.map((event, index) => {
          const eventType = getEventType(event.title);
          const IconComponent = eventTypeIcons[eventType];
          const isActive = index === activeIndex;
          const hasSource = !!event.source;

          return (
            <SwiperSlide key={index}>
              <Flex
                direction="column"
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                borderColor={borderColor}
                bg={isActive ? activeCardBg : cardBg}
                boxShadow={isActive ? "md" : "sm"}
                h="280px"
                transition="all 0.3s"
                cursor="pointer"
                onClick={() => setActiveIndex(index)}
                position="relative"
                overflow="hidden"
              >
                <Flex align="center" justify="space-between" mb={3}>
                  <Flex align="center">
                    <Box
                      bg={isActive ? "blue.500" : "gray.300"}
                      color={isActive ? "white" : "gray.600"}
                      p={2}
                      borderRadius="md"
                      mr={3}
                    >
                      <IconComponent />
                    </Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.500">
                      {formatDate(event.date)}
                    </Text>
                  </Flex>

                  {hasSource && (
                    <Tooltip
                      label="ดูข้อมูลเพิ่มเติมจากแหล่งอ้างอิง"
                      placement="top"
                      hasArrow
                    >
                      <IconButton
                        aria-label="ดูข้อมูลเพิ่มเติม"
                        icon={<FaExternalLinkAlt />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={(e) => handleSourceClick(e, event.source!)}
                      />
                    </Tooltip>
                  )}
                </Flex>

                <Text fontWeight="bold" fontSize="md" mb={3} noOfLines={2}>
                  {event.title}
                </Text>

                <Text fontSize="sm" noOfLines={8} flex="1" overflow="hidden">
                  {event.description}
                </Text>

                {hasSource && <Box mt={2} textAlign="right"></Box>}
              </Flex>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </Box>
  );
};

export default TimelineCarousel;
