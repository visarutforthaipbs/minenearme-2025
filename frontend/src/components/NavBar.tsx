import React from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Link,
  Image,
  useColorModeValue,
  Divider,
  IconButton,
  VStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { HamburgerIcon } from "@chakra-ui/icons";

// Helper component for nav links
interface NavLinkProps {
  children: React.ReactNode;
  to: string;
  isActive: boolean;
  activeColor: string;
  inactiveColor: string;
}

const NavLink = ({
  children,
  to,
  isActive,
  activeColor,
  inactiveColor,
}: NavLinkProps) => {
  return (
    <Link
      as={RouterLink}
      to={to}
      px={2}
      py={1}
      fontWeight={isActive ? "bold" : "medium"}
      color={isActive ? activeColor : inactiveColor}
      borderBottom={isActive ? "2px solid" : "none"}
      borderColor="white"
      _hover={{
        textDecoration: "none",
        color: "white",
        borderBottom: "2px solid",
        borderColor: "white",
      }}
    >
      {children}
    </Link>
  );
};

// Helper component for mobile nav links
interface MobileNavLinkProps {
  children: React.ReactNode;
  to: string;
  isActive: boolean;
  onClick: () => void;
}

const MobileNavLink = ({
  children,
  to,
  isActive,
  onClick,
}: MobileNavLinkProps) => {
  return (
    <Link
      as={RouterLink}
      to={to}
      onClick={onClick}
      fontSize="lg"
      fontWeight={isActive ? "bold" : "medium"}
      color={isActive ? "white" : "whiteAlpha.900"}
      borderLeft={isActive ? "3px solid" : "none"}
      borderColor="white"
      pl={isActive ? 3 : 0}
      _hover={{
        textDecoration: "none",
        color: "white",
      }}
    >
      {children}
    </Link>
  );
};

/**
 * NavBar component that implements the new theme tokens
 *
 * This component demonstrates:
 * - Using semantic color tokens
 * - Dark mode compatibility
 * - Consistent branding
 * - Mobile responsiveness with hamburger menu
 */
const NavBar = () => {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Using the semantic color tokens for active/inactive links
  const activeLinkColor = "white";
  const inactiveLinkColor = "whiteAlpha.900";

  // Background with responsive color mode support
  const bgColor = "brand.primary"; // Orange background
  const borderColor = useColorModeValue("brand.lightBg", "gray.700");

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box as="nav" width="100%" position="sticky" top={0} zIndex={10}>
      {/* Main navbar with brand colors */}
      <Flex
        className="mining-pattern-subtle"
        bg={bgColor}
        color="heading"
        h="60px"
        px={4}
        borderBottom="1px"
        borderColor={borderColor}
        align="center"
        justify="space-between"
      >
        {/* Logo and Site Title */}
        <Flex align="center">
          <Image src="/assets/logos/logo-navbar.svg" alt="Logo" height="40px" />
        </Flex>

        {/* Desktop Navigation Links - only show on medium+ screens */}
        <HStack spacing={8} display={{ base: "none", md: "flex" }}>
          <NavLink
            to="/"
            isActive={isActive("/")}
            activeColor={activeLinkColor}
            inactiveColor={inactiveLinkColor}
          >
            🔍 ค้นหาเหมืองใกล้ฉัน
          </NavLink>

          <NavLink
            to="/cases"
            isActive={isActive("/cases")}
            activeColor={activeLinkColor}
            inactiveColor={inactiveLinkColor}
          >
            เรื่องจริงจากชุมชน
          </NavLink>

          {/* Grayed out - Coming Soon */}
          <Text
            px={2}
            py={1}
            fontWeight="medium"
            color="whiteAlpha.500"
            cursor="not-allowed"
            fontSize="sm"
            position="relative"
            _hover={{
              color: "whiteAlpha.600",
            }}
          >
            แจ้งปัญหาจากพื้นที่
            <Text fontSize="xs" color="whiteAlpha.400" mt={-1}>
              (เร็วๆ นี้)
            </Text>
          </Text>

          {/* Grayed out - Coming Soon */}
          <Text
            px={2}
            py={1}
            fontWeight="medium"
            color="whiteAlpha.500"
            cursor="not-allowed"
            fontSize="sm"
            position="relative"
            _hover={{
              color: "whiteAlpha.600",
            }}
          >
            ค้นหาข้อมูลเชิงลึก
            <Text fontSize="xs" color="whiteAlpha.400" mt={-1}>
              (เร็วๆ นี้)
            </Text>
          </Text>
        </HStack>

        {/* Right side - Organization logos (desktop) and hamburger (mobile) */}
        <Flex align="center">
          {/* Organization logos - only show on medium+ screens with rotation */}
          <HStack spacing={4} display={{ base: "none", md: "flex" }}>
            <Image
              src="/assets/logos/1.png?v=1"
              alt="Organization logo 1"
              height="30px"
            />
            <Image
              src={`/assets/logos/2-1.png?t=${Date.now()}`}
              alt="Organization logo 2"
              height="30px"
            />
            <Image
              src="/assets/logos/3.png?v=1"
              alt="Organization logo 3"
              height="30px"
            />
          </HStack>

          {/* Hamburger menu - only show on small screens */}
          <IconButton
            display={{ base: "flex", md: "none" }}
            onClick={onOpen}
            variant="ghost"
            color="white"
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            _hover={{
              bg: "whiteAlpha.200",
            }}
          />
        </Flex>
      </Flex>

      {/* Secondary navbar - only show on homepage and medium+ screens */}
      {location.pathname === "/" && (
        <Flex
          bg="orange.100"
          px={4}
          py={2}
          display={{ base: "none", md: "flex" }}
          borderBottom="1px"
          borderColor={borderColor}
        >
          <HStack spacing={4}>
            <Text fontSize="sm" color="gray.700">
              ข้อมูลอัพเดทล่าสุด: มิถุนายน 2568, 2018
            </Text>
            <Divider orientation="vertical" height="20px" color="gray.500" />
            <Text fontSize="sm" color="gray.700">
              แหล่งข้อมูล: กรมอุตสาหกรรมพื้นฐานและการเหมืองแร่ และ Myanmar
              Centre for Responsible Business (MCRB)
            </Text>
          </HStack>
        </Flex>
      )}

      {/* Mobile Menu Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={bgColor}>
          <DrawerCloseButton color="white" />
          <DrawerHeader color="white">
            <Flex align="center">
              <Image
                src="/assets/logos/logo-navbar.svg"
                alt="Logo"
                height="30px"
              />
            </Flex>
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={6} align="start">
              <MobileNavLink to="/" isActive={isActive("/")} onClick={onClose}>
                🔍 ค้นหาเหมืองใกล้ฉัน
              </MobileNavLink>

              <MobileNavLink
                to="/cases"
                isActive={isActive("/cases")}
                onClick={onClose}
              >
                เรื่องจริงจากชุมชน
              </MobileNavLink>

              <MobileNavLink
                to="/learn"
                isActive={isActive("/learn")}
                onClick={onClose}
              >
                📚 แหล่งความรู้
              </MobileNavLink>

              {/* Coming Soon Items */}
              <Box>
                <Text color="whiteAlpha.500" fontWeight="medium" fontSize="lg">
                  แจ้งปัญหาจากพื้นที่
                </Text>
                <Text fontSize="sm" color="whiteAlpha.400">
                  (เร็วๆ นี้)
                </Text>
              </Box>

              <Box>
                <Text color="whiteAlpha.500" fontWeight="medium" fontSize="lg">
                  ค้นหาข้อมูลเชิงลึก
                </Text>
                <Text fontSize="sm" color="whiteAlpha.400">
                  (เร็วๆ นี้)
                </Text>
              </Box>

              {/* Organization logos in mobile - smaller and stacked */}
              <Box mt={8}>
                <Text color="whiteAlpha.700" fontSize="sm" mb={3}>
                  ร่วมมือกับ:
                </Text>
                <VStack spacing={3}>
                  <Image
                    src="/assets/logos/1.png?v=1"
                    alt="Organization logo 1"
                    height="25px"
                  />
                  <Image
                    src={`/assets/logos/2-1.png?t=${Date.now()}`}
                    alt="Organization logo 2"
                    height="25px"
                  />
                  <Image
                    src="/assets/logos/3.png?v=1"
                    alt="Organization logo 3"
                    height="25px"
                  />
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default NavBar;
