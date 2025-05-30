import React from "react";
import { Box, Text, Heading, Grid, GridItem, VStack } from "@chakra-ui/react";

const PatternDemo = () => {
  return (
    <Box p={8}>
      <Heading mb={6} textAlign="center">
        Mining Pattern Usage Examples
      </Heading>

      <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
        {/* Subtle Pattern */}
        <GridItem>
          <Box
            className="mining-pattern-subtle"
            p={6}
            bg="white"
            borderRadius="md"
            minH="200px"
          >
            <Heading size="md" mb={4}>
              Subtle Pattern
            </Heading>
            <Text>
              This shows a very subtle background pattern perfect for content
              areas.
            </Text>
            <Text mt={2}>Opacity: 0.05</Text>
          </Box>
        </GridItem>

        {/* Medium Pattern */}
        <GridItem>
          <Box
            className="mining-pattern-medium"
            p={6}
            bg="white"
            borderRadius="md"
            minH="200px"
          >
            <Heading size="md" mb={4}>
              Medium Pattern
            </Heading>
            <Text>
              This shows a medium opacity pattern good for section backgrounds.
            </Text>
            <Text mt={2}>Opacity: 0.1</Text>
          </Box>
        </GridItem>

        {/* Card Pattern */}
        <GridItem>
          <Box
            className="mining-pattern-card"
            p={6}
            bg="white"
            borderRadius="md"
            minH="200px"
            boxShadow="md"
          >
            <Heading size="md" mb={4}>
              Card Pattern
            </Heading>
            <Text>
              This shows a card-style pattern perfect for content cards.
            </Text>
            <Text mt={2}>Opacity: 0.03</Text>
          </Box>
        </GridItem>

        {/* Hero Pattern */}
        <GridItem>
          <Box
            className="mining-pattern-hero"
            p={6}
            bg="gray.50"
            borderRadius="md"
            minH="200px"
          >
            <Heading size="md" mb={4}>
              Hero Pattern
            </Heading>
            <Text>
              This shows a hero-style pattern for large sections and landing
              areas.
            </Text>
            <Text mt={2}>Opacity: 0.08</Text>
          </Box>
        </GridItem>

        {/* Loading Pattern */}
        <GridItem>
          <Box className="loading-with-pattern" borderRadius="md" minH="200px">
            <VStack>
              <Heading size="md" color="gray.600">
                Loading Pattern
              </Heading>
              <Text color="gray.600">Animated pattern for loading states</Text>
            </VStack>
          </Box>
        </GridItem>

        {/* Empty State Pattern */}
        <GridItem>
          <Box className="empty-state-pattern" borderRadius="md" minH="200px">
            <Heading size="md" color="gray.600">
              Empty State
            </Heading>
            <Text color="gray.600">Pattern for empty or no-data states</Text>
          </Box>
        </GridItem>

        {/* Direct Pattern */}
        <GridItem>
          <Box className="mining-pattern" p={6} borderRadius="md" minH="200px">
            <Heading
              size="md"
              mb={4}
              color="white"
              textShadow="1px 1px 2px rgba(0,0,0,0.8)"
            >
              Direct Pattern
            </Heading>
            <Text color="white" textShadow="1px 1px 2px rgba(0,0,0,0.8)">
              Full opacity pattern for decorative elements
            </Text>
          </Box>
        </GridItem>
      </Grid>

      <Box mt={8} p={6} bg="gray.50" borderRadius="md">
        <Heading size="md" mb={4}>
          How to Use
        </Heading>
        <Text mb={2}>
          <strong>Subtle:</strong> Add
          `className=&ldquo;mining-pattern-subtle&rdquo;` for content
          backgrounds
        </Text>
        <Text mb={2}>
          <strong>Medium:</strong> Add
          `className=&ldquo;mining-pattern-medium&rdquo;` for section
          backgrounds
        </Text>
        <Text mb={2}>
          <strong>Card:</strong> Add
          `className=&ldquo;mining-pattern-card&rdquo;` for card components
        </Text>
        <Text mb={2}>
          <strong>Hero:</strong> Add
          `className=&ldquo;mining-pattern-hero&rdquo;` for hero sections
        </Text>
        <Text mb={2}>
          <strong>Loading:</strong> Add
          `className=&ldquo;loading-with-pattern&rdquo;` for loading states
        </Text>
        <Text>
          <strong>Empty:</strong> Add
          `className=&ldquo;empty-state-pattern&rdquo;` for empty states
        </Text>
      </Box>
    </Box>
  );
};

export default PatternDemo;
