import { Button } from "@chakra-ui/react";

const CTAButton = ({ children, ...props }: any) => (
  <Button
    colorScheme="orange"
    size="lg"
    _hover={{ transform: "scale(1.07)" }}
    transition="all 0.2s"
    {...props}
  >
    📢 {children}
  </Button>
);

export default CTAButton;
