import React, { useEffect, useState } from "react";
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
import { FaEnvelope } from "react-icons/fa";

// Helper component for nav links with custom icons
interface NavLinkProps {
  children: React.ReactNode;
  to: string;
  isActive: boolean;
  activeColor: string;
  inactiveColor: string;
  showIcon?: boolean;
}

const NavLink = ({
  children,
  to,
  isActive,
  activeColor,
  inactiveColor,
  showIcon = false,
}: NavLinkProps) => {
  return (
    <Link
      as={RouterLink}
      to={to}
      px={showIcon ? 6 : 3}
      py={showIcon ? 3 : 2}
      fontWeight={isActive ? "bold" : "medium"}
      fontSize="md"
      color={isActive ? activeColor : inactiveColor}
      bg={isActive && showIcon ? "rgba(0,0,0,0.8)" : "transparent"}
      borderRadius={showIcon ? "full" : "none"}
      borderBottom={!showIcon && isActive ? "2px solid" : "none"}
      borderColor="white"
      display="flex"
      alignItems="center"
      gap={2}
      transition="all 0.3s ease"
      _hover={{
        textDecoration: "none",
        color: showIcon ? "white" : "white",
        bg: showIcon ? "rgba(0,0,0,0.8)" : "transparent",
        borderBottom: !showIcon ? "2px solid" : "none",
        borderColor: "white",
      }}
    >
      {showIcon && (
        <Box width="19px" height="22px" flexShrink={0}>
          <Image
            src={
              isActive
                ? "/assets/icon/nav_search_icon_active.svg"
                : "/assets/icon/nav_search_icon_inactive.svg"
            }
            alt="Search icon"
            width="19px"
            height="22px"
          />
        </Box>
      )}
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
  showIcon?: boolean;
}

const MobileNavLink = ({
  children,
  to,
  isActive,
  onClick,
  showIcon = false,
}: MobileNavLinkProps) => {
  return (
    <Link
      as={RouterLink}
      to={to}
      onClick={onClick}
      fontSize="xl"
      fontWeight="bold"
      color={isActive ? "white" : "whiteAlpha.900"}
      borderLeft={isActive ? "3px solid" : "none"}
      borderColor="white"
      pl={isActive ? 3 : 0}
      mb={2}
      display="flex"
      alignItems="center"
      gap={2}
      _hover={{
        textDecoration: "none",
        color: "white",
      }}
    >
      {showIcon && (
        <Box width="19px" height="22px" flexShrink={0}>
          <Image
            src={
              isActive
                ? "/assets/icon/nav_search_icon_active.svg"
                : "/assets/icon/nav_search_icon_inactive.svg"
            }
            alt="Search icon"
            width="19px"
            height="22px"
          />
        </Box>
      )}
      {children}
    </Link>
  );
};

const orgLogos = [
  { src: "/assets/logos/1.png?v=1", alt: "Organization logo 1" },
  { src: `/assets/logos/2-1.png?t=${Date.now()}`, alt: "Organization logo 2" },
  { src: "/assets/logos/3.png?v=1", alt: "Organization logo 3" },
  { src: "/assets/logos/cja-logo.svg", alt: "CJA logo" },
];

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

  // Rotating logo state
  const [logoIndex, setLogoIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setLogoIndex((prev) => (prev + 1) % orgLogos.length);
    }, 2000); // Change logo every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Box as="nav" width="100%" position="sticky" top={0} zIndex={10}>
      {/* Main navbar with brand colors */}
      <Flex
        className="mining-pattern-subtle"
        bg={bgColor}
        color="heading"
        h="80px"
        px={6}
        borderBottom="1px"
        borderColor={borderColor}
        align="center"
        justify="space-between"
      >
        {/* Logo and Site Title */}
        <Flex align="center">
          <Image src="/assets/logos/logo-navbar.svg" alt="Logo" height="50px" />
        </Flex>

        {/* Desktop Navigation Links - only show on medium+ screens */}
        <HStack spacing={10} display={{ base: "none", md: "flex" }}>
          <NavLink
            to="/"
            isActive={isActive("/")}
            activeColor={activeLinkColor}
            inactiveColor={inactiveLinkColor}
            showIcon={true}
          >
            ค้นหาเหมืองใกล้ฉัน
          </NavLink>

          <NavLink
            to="/cases"
            isActive={isActive("/cases")}
            activeColor={activeLinkColor}
            inactiveColor={inactiveLinkColor}
          >
            เรื่องจริงจากชุมชน
          </NavLink>

          {/* Now active - links to external site, styled like NavLink */}
          <Link
            href="https://csite.thaipbs.or.th/home"
            px={2}
            py={1}
            fontWeight={isActive("/external-dummy-path") ? "bold" : "medium"}
            color={
              isActive("/external-dummy-path")
                ? activeLinkColor
                : inactiveLinkColor
            }
            borderBottom={
              isActive("/external-dummy-path") ? "2px solid" : "none"
            }
            borderColor="white"
            _hover={{
              textDecoration: "none",
              color: "white",
              borderBottom: "2px solid",
              borderColor: "white",
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            แจ้งปัญหาจากพื้นที่
          </Link>

          {/* Grayed out - Coming Soon */}
          <Box
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
            <Text as="span">ข้อมูลเชิงลึก</Text>
            <Text
              as="span"
              fontSize="xs"
              color="whiteAlpha.400"
              display="block"
              mt={-1}
            >
              (เร็วๆ นี้)
            </Text>
          </Box>
        </HStack>

        {/* Right side - Contact icon, Organization logos (desktop) and hamburger (mobile) */}
        <Flex align="center" gap={4}>
          {/* Contact Us icon - only show on medium+ screens */}
          <IconButton
            as={RouterLink}
            to="/about"
            display={{ base: "none", md: "flex" }}
            variant="ghost"
            color="white"
            aria-label="Contact Us"
            icon={<FaEnvelope />}
            size="md"
            _hover={{
              bg: "whiteAlpha.200",
              transform: "scale(1.1)",
            }}
            _active={{
              bg: "whiteAlpha.300",
            }}
            transition="all 0.2s"
          />

          {/* Organization logos - only show on medium+ screens with rotation */}
          <Box
            display={{ base: "none", md: "flex" }}
            width="70px"
            height="40px"
            alignItems="center"
            justifyContent="center"
          >
            <Image
              src={orgLogos[logoIndex].src}
              alt={orgLogos[logoIndex].alt}
              width="100%"
              height="100%"
              objectFit="contain"
              transition="opacity 0.5s"
            />
          </Box>

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
          px={6}
          py={3}
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
              <MobileNavLink
                to="/"
                isActive={isActive("/")}
                onClick={onClose}
                showIcon={true}
              >
                ค้นหาเหมืองใกล้ฉัน
              </MobileNavLink>

              <MobileNavLink
                to="/cases"
                isActive={isActive("/cases")}
                onClick={onClose}
              >
                เรื่องจริงจากชุมชน
              </MobileNavLink>

              <MobileNavLink
                to="/about"
                isActive={isActive("/about")}
                onClick={onClose}
              >
                ติดต่อเรา
              </MobileNavLink>

              <Link
                href="https://csite.thaipbs.or.th/home"
                onClick={onClose}
                fontSize="xl"
                fontWeight="bold"
                color="white"
                mb={2}
                _hover={{
                  color: "whiteAlpha.800",
                  textDecoration: "underline",
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                แจ้งปัญหาจากพื้นที่
              </Link>

              <Box
                fontSize="xl"
                fontWeight="bold"
                color="whiteAlpha.500"
                mb={2}
                cursor="not-allowed"
              >
                <Text as="span">ข้อมูลเชิงลึก</Text>
                <Text
                  as="span"
                  fontSize="sm"
                  color="whiteAlpha.400"
                  display="block"
                >
                  (เร็วๆ นี้)
                </Text>
              </Box>

              {/* Organization logos in mobile - smaller and stacked */}
              <Box mt={8}>
                <Text color="whiteAlpha.700" fontSize="sm" mb={3}>
                  ร่วมมือกับ:
                </Text>
                <Box
                  width="70px"
                  height="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Image
                    src={orgLogos[logoIndex].src}
                    alt={orgLogos[logoIndex].alt}
                    width="100%"
                    height="100%"
                    objectFit="contain"
                    transition="opacity 0.5s"
                  />
                </Box>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default NavBar;
