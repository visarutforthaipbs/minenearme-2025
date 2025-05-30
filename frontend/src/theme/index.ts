import { extendTheme } from "@chakra-ui/react";
import type { ThemeConfig } from "@chakra-ui/react";
import type { StyleFunctionProps } from "@chakra-ui/theme-tools";
import "./fonts.css"; // Import custom fonts CSS

// Define config
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// Define fonts
const fonts = {
  heading: `'DB Helvethaica X', sans-serif`,
  body: `'DB Helvethaica X', sans-serif`,
};

// Define brand colors
export const colors = {
  brand: {
    primary: "#FF6600", // Primary Brand Orange
    darkText: "#222222", // Dark text
    neutralGray: "#666666", // Secondary text / dividers
    lightBg: "#F9F6F1", // Light background blocks
    white: "#FFFFFF", // Main content background
    accentTeal: "#009688", // Info highlights / success
    warning: "#FFC107", // Warnings / tooltips
    error: "#E53935", // Error states
    linkHover: "#CC5200", // Link hover
  },
  // Keep existing colors for backwards compatibility
  forest: { 500: "#2E4D41" },
  orange: { 500: "#FF6600" }, // Updated to match brand.primary
  blue: { 500: "#009688" }, // Updated to match brand.accentTeal
  green: { 500: "#009688" }, // Updated to match brand.accentTeal
  teal: { 500: "#009688" }, // Updated to match brand.accentTeal
  red: { 500: "#E53935" }, // Updated to match brand.error
  charcoal: { 500: "#333333" },
  offwhite: { 50: "#F9F6F1" },
};

// Define semantic tokens
const semanticTokens = {
  colors: {
    heading: { default: "brand.darkText", _dark: "brand.white" },
    body: { default: "brand.darkText", _dark: "brand.lightBg" },
    textSecondary: { default: "brand.neutralGray", _dark: "whiteAlpha.700" },
    bg: { default: "brand.white", _dark: "brand.darkText" },
    cardBg: { default: "brand.lightBg", _dark: "gray.700" },
    highlight: { default: "brand.primary", _dark: "brand.primary" },
    success: { default: "brand.accentTeal", _dark: "brand.accentTeal" },
    warning: { default: "brand.warning", _dark: "brand.warning" },
    error: { default: "brand.error", _dark: "brand.error" },
  },
};

// Define global styles
const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      bg: props.colorMode === "dark" ? "brand.darkText" : "brand.white",
      color: props.colorMode === "dark" ? "brand.lightBg" : "brand.darkText",
      fontFamily: fonts.body,
    },
    a: {
      color: "brand.primary",
      _hover: { color: "brand.linkHover" },
    },
  }),
};

// Define component variants
const components = {
  Button: {
    defaultProps: {
      colorScheme: "orange",
    },
    variants: {
      solid: {
        bg: "brand.primary",
        color: "white",
        _hover: { bg: "brand.linkHover" },
      },
      outline: {
        borderColor: "brand.primary",
        color: "brand.primary",
        _hover: { bg: "brand.primary", color: "white" },
      },
    },
  },
  Link: {
    baseStyle: {
      color: "brand.primary",
      _hover: { color: "brand.linkHover" },
    },
  },
  Alert: {
    variants: {
      success: {
        container: { bg: "brand.accentTeal" },
      },
      warning: {
        container: { bg: "brand.warning" },
      },
      error: {
        container: { bg: "brand.error" },
      },
    },
  },
  Badge: {
    defaultProps: {
      colorScheme: "orange", // Default badge color is brand orange
    },
    variants: {
      solid: {
        bg: "brand.primary",
        color: "white",
      },
      outline: {
        borderColor: "brand.primary",
        color: "brand.primary",
      },
      subtle: {
        bg: "orange.100",
        color: "brand.darkText",
      },
      info: {
        bg: "brand.accentTeal",
        color: "white",
      },
      warning: {
        bg: "brand.warning",
        color: "black",
      },
      error: {
        bg: "brand.error",
        color: "white",
      },
    },
  },
  Divider: {
    baseStyle: {
      borderColor: "brand.neutralGray",
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: "cardBg",
        borderColor: "brand.lightBg",
      },
    },
  },
  NavBar: {
    baseStyle: {
      bg: "brand.primary",
      color: "white",
    },
  },
  Stat: {
    baseStyle: {
      container: {
        bg: "orange.50",
      },
    },
  },
};

// Extend the theme
const theme = extendTheme({
  config,
  fonts,
  colors,
  styles,
  semanticTokens,
  components,
});

export default theme;
