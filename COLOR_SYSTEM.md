# เหมืองใกล้ฉัน Color System

This document outlines the color system for the เหมืองใกล้ฉัน (Mine Near Me) application and provides guidelines for ensuring consistent use of colors across all components and pages.

## Brand Colors

Our application uses the following brand colors:

| Color Name      | Hex Code  | Usage                                             |
| --------------- | --------- | ------------------------------------------------- |
| **primary**     | `#FF6600` | Primary brand orange, main buttons, active states |
| **darkText**    | `#222222` | Primary text color                                |
| **neutralGray** | `#666666` | Secondary text, dividers                          |
| **lightBg**     | `#F9F6F1` | Light background blocks, cards                    |
| **white**       | `#FFFFFF` | Main content background                           |
| **accentTeal**  | `#009688` | Info highlights, success states                   |
| **warning**     | `#FFC107` | Warnings, tooltips                                |
| **error**       | `#E53935` | Error states, alerts                              |
| **linkHover**   | `#CC5200` | Link hover state                                  |

## How to Use Colors in Components

### Using Color Schemes with Chakra UI Components

Always use the brand color schemes when creating components:

```tsx
// Good
<Button colorScheme="orange">ส่งข้อมูล</Button>

// Good - using outline variant
<Button colorScheme="orange" variant="outline">แชร์</Button>

// Avoid - using non-brand colors
<Button colorScheme="blue">ส่งข้อมูล</Button>
```

### Using the Color Utility

For consistent colors, use the `colorUtils` helper:

```tsx
import { getColorScheme } from '../utils/colorUtils';

// For primary actions
<Button colorScheme={getColorScheme('primary')}>บันทึก</Button>

// For success states
<Button colorScheme={getColorScheme('success')}>ยืนยัน</Button>
```

### Semantic Color Usage

Use colors consistently based on their semantic meaning:

- **Orange (Primary)**: Main actions, branding, active states
- **Teal (Secondary)**: Success actions, secondary actions
- **Red**: Errors, destructive actions
- **Yellow**: Warnings, cautions

## Dark Mode Considerations

The theme includes dark mode variants. Semantic color tokens should be used to ensure proper color adaptation between light and dark modes:

```tsx
// Use semantic tokens when possible
<Box bg="cardBg">Content here</Box>

// Instead of direct colors
<Box bg="white">Content here</Box>
```

## Adding New Components

When creating new components:

1. Use the brand color scheme (`orange` for primary actions)
2. Use semantic tokens for background colors and text
3. Consider both light and dark mode appearance
4. Use the `getColorScheme()` utility for dynamic color selection

## Updating This System

When updating the color system:

1. Update the base colors in `src/theme/index.ts`
2. Update semantic tokens if needed
3. Update the `COLOR_MAPPINGS` in `src/utils/colorUtils.ts`
4. Document changes in this file

By following these guidelines, we can maintain a consistent look and feel across our application while allowing for flexibility and future changes.
