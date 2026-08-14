import { Box, HStack, Skeleton, VStack } from "astralis-ui";

export function SkeletonDemo() {
  return (
    <Box w="sm" maxW="full">
      <HStack gap="4" alignItems="center">
        <Skeleton variant="circle" w="12" h="12" className="astralis:shrink-0" />
        <VStack gap="2" alignItems="stretch" className="astralis:flex-1">
          <Skeleton variant="text" w="3/4" />
          <Skeleton variant="text" />
        </VStack>
      </HStack>
      <Skeleton variant="rect" mt="4" h="24" />
    </Box>
  );
}
