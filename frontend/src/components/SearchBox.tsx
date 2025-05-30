import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  List,
  ListItem,
  Text,
  Badge,
  Flex,
  IconButton,
  useOutsideClick,
  Spinner,
  Divider,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { searchAllData, getSearchResultTypeInfo } from "../utils/search";
import type { SearchResult } from "../utils/search";

// Type definitions
interface GeoJSONFeature {
  type: string;
  properties: {
    id: number;
    name: string;
    [key: string]: string | number | boolean;
  };
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
}

interface SearchBoxProps {
  placeholder?: string;
  onResultSelect?: (result: SearchResult) => void;
  size?: "sm" | "md" | "lg";
  maxResults?: number;
}

const SearchBox = ({
  placeholder = "ค้นหาเหมือง โซนศักยภาพ หรือพื้นที่เสี่ยง...",
  onResultSelect,
  size = "md",
  maxResults = 5,
}: SearchBoxProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useOutsideClick({
    ref: searchRef as React.RefObject<HTMLElement>,
    handler: () => setShowResults(false),
  });

  // Handle search when query changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query) {
        setIsSearching(true);
        const searchResults = searchAllData(query);
        setResults(searchResults.slice(0, maxResults));
        setIsSearching(false);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, maxResults]);

  // Handle selecting a search result
  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    }
    setShowResults(false);
    setQuery(""); // Clear search after selection
  };

  // Clear search input
  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <Box position="relative" width="100%" ref={searchRef} zIndex={1000}>
      <InputGroup size={size}>
        <InputLeftElement>
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          borderRadius="full"
          bg="white"
          boxShadow="sm"
        />
        {query && (
          <InputRightElement>
            {isSearching ? (
              <Spinner size="sm" color="gray.400" />
            ) : (
              <IconButton
                aria-label="Clear search"
                icon={<CloseIcon />}
                size="sm"
                variant="ghost"
                onClick={handleClearSearch}
              />
            )}
          </InputRightElement>
        )}
      </InputGroup>

      {showResults && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={2}
          bg="white"
          boxShadow="md"
          borderRadius="md"
          maxH="300px"
          overflowY="auto"
          zIndex={1001}
        >
          {results.length > 0 ? (
            <List>
              {results.map((result) => {
                const typeInfo = getSearchResultTypeInfo(result.type);
                return (
                  <ListItem
                    key={`${result.type}-${result.id}`}
                    p={3}
                    _hover={{ bg: "gray.50" }}
                    cursor="pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <Flex alignItems="center">
                      <Text fontSize="lg" mr={2}>
                        {typeInfo.icon}
                      </Text>
                      <Box flex={1}>
                        <Text fontWeight="medium">{result.name}</Text>
                        <Flex mt={1}>
                          <Badge colorScheme={typeInfo.color} mr={2}>
                            {result.type === "mine"
                              ? "เหมือง"
                              : result.type === "potential"
                                ? "โซนศักยภาพ"
                                : "โซนเสี่ยง"}
                          </Badge>
                          {result.type === "mine" && (
                            <Badge colorScheme="blue">
                              {result.properties.mineral}
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                    </Flex>
                    <Divider mt={2} />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box p={3} textAlign="center" color="gray.500">
              ไม่พบผลลัพธ์
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchBox;
