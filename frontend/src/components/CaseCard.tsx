import React from "react";
import { Box, Heading, Tag, Image, Link } from "@chakra-ui/react";

interface CaseCardProps {
  id: number;
  title: string;
  tags: string[];
  image: string;
}

const CaseCard = ({ id, title, tags, image }: CaseCardProps) => (
  <Link href={`/cases/${id}`} _hover={{ textDecoration: "none" }}>
    <Box
      className="mining-pattern-card"
      boxShadow="md"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      _hover={{ transform: "scale(1.03)" }}
      transition="all 0.2s"
    >
      <Image src={image} alt={title} h="180px" w="100%" objectFit="cover" />
      <Box p={4}>
        <Heading size="md">{title}</Heading>
        <Box mt={2}>
          {tags.map((tag) => (
            <Tag key={tag} mr={2} colorScheme="orange">
              {tag}
            </Tag>
          ))}
        </Box>
      </Box>
    </Box>
  </Link>
);

export default CaseCard;
