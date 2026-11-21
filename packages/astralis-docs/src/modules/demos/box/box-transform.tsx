import { Box, HStack, Image, Text } from "astralis-ui";

const PHOTO = "/image-demo.jpg";

export function BoxTransform() {
  return (
    <HStack gap="6" wrap="wrap" justifyContent="center" alignItems="center">
      <Box overflow="hidden" rounded="xl" w="56" h="40">
        <Box h="full" transition="transform" hover={{ scale: "105" }}>
          <Image src={PHOTO} alt="Product photo" w="full" h="full" objectFit="cover" />
        </Box>
      </Box>
      <Box
        as="button"
        w="56"
        p="6"
        bg="base"
        rounded="xl"
        border="normal"
        borderColor="subtle"
        shadow="sm"
        transition="common"
        hover={{ translateY: "-1", shadow: "lg" }}
        active={{ scale: "95" }}
      >
        <Text weight="medium">Lifts on hover</Text>
        <Text size="sm" color="muted">
          and presses in when clicked
        </Text>
      </Box>
    </HStack>
  );
}
