"use client";

import Link from "next/link";
import { Box, Button, Flex, Heading, Stack, Text } from "astralis-ui";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";
import { BrandScene } from "./scene/brand-scene";

export function FinalCta() {
  return (
    // Isolation has no prop.
    <Box as="section" position="relative" overflow="hidden" py={{ base: "36", lg: "44" }} className="isolate">
      {/* A negative z-index is not one of zIndex's named levels. */}
      <Box aria-hidden="true" position="absolute" inset="0" className="-z-10">
        <BrandScene fade="none" />
        <Box position="absolute" inset="0" className="cta-veil" />
      </Box>

      {/* Box has no text-align prop. */}
      <Stack position="relative" mx="auto" maxW="48rem" alignItems="center" px="6" className="text-center">
        <Reveal>
          <Heading
            size={{ base: "5xl", sm: "6xl" }}
            weight="semibold"
            lineHeight="size"
            color="base"
            className="text-balance"
          >
            Ship something <Box as="span" className="text-gradient">stellar</Box>
          </Heading>
          <Text mx="auto" mt="6" size="lg" color="muted" className="text-balance lg:whitespace-nowrap">
            Install the package, add the provider, and every component here is yours.
          </Text>
          <Flex mt="10" wrap="wrap" justifyContent="center" gap="4">
            <Button as={Link} href="/docs" size="lg" rounded="xl" rightIcon={<ArrowRight size={18} />}>
              Start building
            </Button>
            <Button
              as={Link}
              href="/docs/components/button"
              size="lg"
              rounded="xl"
              variant="outline"
              colorScheme="gray"
              className="bg-surface/60 backdrop-blur"
            >
              Read the docs
            </Button>
          </Flex>
        </Reveal>
      </Stack>
    </Box>
  );
}
