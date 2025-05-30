import { colors } from "../theme";

/**
 * Utility functions to ensure consistent color usage across the application
 */

// Common semantic color mappings
export const COLOR_MAPPINGS = {
  primary: "orange", // Brand primary color
  secondary: "teal", // Using accent teal as secondary
  success: "teal", // Success actions
  info: "teal", // Informational elements
  warning: "yellow", // Warning notifications
  error: "red", // Error states
  neutral: "gray", // Neutral elements
};

/**
 * Gets the appropriate brand color scheme name for a given semantic use
 * @param semantic - The semantic color need (primary, success, error, etc)
 * @returns The correct color scheme name to use with Chakra components
 */
export const getColorScheme = (
  semantic: keyof typeof COLOR_MAPPINGS = "primary"
): string => {
  return COLOR_MAPPINGS[semantic];
};

/**
 * Gets a hex color value for a specific brand color
 * @param colorKey - The key in the brand colors object
 * @returns The hex color value
 */
export const getBrandColor = (colorKey: keyof typeof colors.brand): string => {
  return colors.brand[colorKey];
};

export default {
  getColorScheme,
  getBrandColor,
  COLOR_MAPPINGS,
};
