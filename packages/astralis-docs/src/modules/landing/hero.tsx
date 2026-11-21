"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  useTheme,
  Button, Card, Stat, Badge, Avatar, Switch, Slider, Tag, HStack, VStack,
  Box, Flex, Grid, Link as AstralisLink, Stack, Text,
} from "astralis-ui";
import { ArrowRight } from "lucide-react";
import { CopyCommand } from "@/modules/docs/copy-command";
import { EASE, Entrance, useEntranceTransition } from "./reveal";
import { BrandScene } from "./scene/brand-scene";

const swatches = [
  // First entry = the library's actual default brand (yellow-500).
  { name: "Brand", hex: "#eab308" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Green", hex: "#22c55e" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Cyan", hex: "#06b6d4" },
];

export function Hero() {
  // The picker re-themes the whole site through the provider, which stores the
  // choice. The default swatch clears it rather than storing the default.
  const { tokens, setTokens } = useTheme();
  const brand = tokens?.brandColor ?? swatches[0].hex;
  const setBrand = (hex: string) =>
    setTokens(hex.toLowerCase() === swatches[0].hex ? undefined : { brandColor: hex });
  const cardTransition = useEntranceTransition({ duration: 1, delay: 0.3, ease: EASE });

  return (
    <Flex
      as="section"
      position="relative"
      alignItems="center"
      overflow="hidden"
      // The header is h-14 (3.5rem): the hero fills the rest of the first screen,
      // up to 60rem so very tall monitors do not get a mostly empty hero.
      minH={{ lg: "min(calc(100svh - 3.5rem), 60rem)" }}
      // Isolation has no prop.
      className="isolate"
    >
      {/* A negative z-index is not one of zIndex's named levels. */}
      <Box aria-hidden="true" position="absolute" inset="0" className="-z-10">
        <BrandScene fade="left" />
        <Box position="absolute" inset="0" className="hero-veil" />
      </Box>

      <Grid
        mx="auto"
        w="full"
        maxW="7xl"
        alignItems="center"
        gap="16"
        px={{ base: "6", lg: "14" }}
        py={{ base: "12", lg: "16" }}
        columns={{ lg: "2" }}
      >
        <Stack minW="0" alignItems="start">
          <Entrance delay={0}>
            {/* 2.6rem, the 420px step and the 1.02 leading sit off the type scale and its breakpoints. */}
            <Box
              as="h1"
              color="base"
              className="font-display text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-tight min-[420px]:text-5xl sm:text-6xl"
            >
              Interfaces with a<br />
              <Box as="span" className="text-gradient">stellar finish</Box>
            </Box>
          </Entrance>

          <Entrance delay={0.08}>
            <Text mt="8" maxW="lg" size="md" lineHeight="relaxed" color="muted" textWrap="pretty">
              Accessible, themeable React components for crafting polished web apps and
              design systems. Server-first, built for the Next.js RSC
            </Text>
          </Entrance>

          <Entrance delay={0.16}>
            <Flex mt="10" wrap="wrap" alignItems="center" gap="2.5" role="group" aria-label="Try a brand color">
              {swatches.map((swatch) => {
                const selected = brand === swatch.hex;
                return (
                  <Box
                    as="button"
                    key={swatch.hex}
                    type="button"
                    aria-label={`Brand color ${swatch.name}`}
                    aria-pressed={selected}
                    onClick={() => setBrand(swatch.hex)}
                    size="9"
                    cursor="pointer"
                    rounded="full"
                    bg={swatch.hex}
                    opacity={selected ? undefined : "0.8"}
                    hover={selected ? undefined : { opacity: "1" }}
                    // Scale, ring and focus outline have no props.
                    className={`transition-all duration-200 hover:scale-115 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ring ${
                      selected ? "scale-110 ring-2 ring-accent-ring ring-offset-2 ring-offset-surface" : ""
                    }`}
                  />
                );
              })}
              <Flex
                as="label"
                position="relative"
                ml="1"
                size="9"
                cursor="pointer"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
                rounded="full"
                border="normal"
                borderStyle="dashed"
                borderColor="base"
                color="muted"
                hover={{ color: "base" }}
                // A translucent surface, the blur and the scale have no props.
                className="bg-surface/40 backdrop-blur transition-all duration-200 hover:scale-110"
              >
                <Text as="span" size="md" lineHeight="none">+</Text>
                <Box
                  as="input"
                  type="color"
                  value={brand}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrand(e.target.value)}
                  aria-label="Pick a custom brand color"
                  position="absolute"
                  inset="0"
                  cursor="pointer"
                  opacity="0"
                />
              </Flex>
              <Text as="span" ml="2" fontFamily="mono" size="xs" color="subtle" numeric="tabular">
                {brand}
              </Text>
            </Flex>
          </Entrance>

          <Entrance delay={0.24}>
            <Flex mt="12" wrap="wrap" gap="4">
              <Button as={Link} href="/docs" size="md" rounded="xl" rightIcon={<ArrowRight size={18} />}>
                Get started
              </Button>
              <Button
                as={Link}
                href="/docs/components/button"
                size="md"
                rounded="xl"
                variant="outline"
                colorScheme="gray"
                className="bg-surface/60 backdrop-blur"
              >
                Browse components
              </Button>
            </Flex>

            <Flex
              mt="6"
              direction={{ base: "column", sm: "row" }}
              alignItems={{ base: "start", sm: "center" }}
              gap={{ base: "2", sm: "3" }}
            >
              <Box shrink="0">
                <CopyCommand command="npx astralis-cli create my-app" />
              </Box>
              <Text as="span" size="xs" color="subtle" whiteSpace={{ sm: "nowrap" }}>
                Scaffold your React project ·{" "}
                <AstralisLink as={Link} href="/docs/cli" color="subtle" hover={{ color: "muted" }} variant="underline">
                  How the CLI works
                </AstralisLink>
              </Text>
            </Flex>
          </Entrance>
        </Stack>

        {/* Live composition: floats over the scene; every accent tracks the brand */}
        {/*
          * Not `<Box as={motion.div}>`: Box writes every prop into its dev-only
          * data-astralis-props attribute, and `transition` differs between the
          * server and a reduced-motion client, so hydration fails.
          */}
        <motion.div
          className="relative lg:pl-6"
          initial={{ opacity: 0, y: 40, rotate: 1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={cardTransition}
        >
          <Box className="animate-float-slow">
            <Card variant="elevated" className="bg-raised/85 backdrop-blur-xl">
              <Card.Header extra={<Badge colorScheme="brand" variant="subtle">Live</Badge>}>
                <Card.Title>Mission control</Card.Title>
                <Card.Description>Recolored by the swatches, no rebuild</Card.Description>
              </Card.Header>
              <Card.Body>
                <VStack gap="5" alignItems="stretch">
                  <HStack gap="3" justifyContent="between">
                    <HStack gap="3">
                      <Avatar.Group max={3} size="sm">
                        <Avatar name="Nova Starling" />
                        <Avatar name="Alex Kim" />
                        <Avatar name="Maria Lopez" />
                        <Avatar name="Sam Patel" />
                      </Avatar.Group>
                      <Switch defaultChecked size="sm">Auto-deploy</Switch>
                    </HStack>
                    <Tag colorScheme="brand" size="sm">Production</Tag>
                  </HStack>

                  <Stat>
                    <Stat.Label>Deploys this week</Stat.Label>
                    <Stat.Value>1,284</Stat.Value>
                    <Stat.HelpText>
                      <Stat.Indicator type="increase">18.9%</Stat.Indicator> vs last week
                    </Stat.HelpText>
                  </Stat>

                  <Slider defaultValue={64} showTooltip={false} size="sm" />
                </VStack>
              </Card.Body>
              <Card.Footer>
                <HStack gap="2">
                  <Button size="sm">Deploy</Button>
                  <Button size="sm" variant="subtle">Preview</Button>
                  <Button size="sm" variant="text" colorScheme="gray">Logs</Button>
                </HStack>
              </Card.Footer>
            </Card>
          </Box>

          {/*
            * The float keyframes and the translucent, blurred surface have no props.
            * `shadow-lg` stays a class: shadow="lg" is the library's token, which is
            * far darker in dark mode than this soft Tailwind shadow.
            */}
          <Box
            position="absolute"
            left="-2rem"
            top="-1.5rem"
            display={{ base: "hidden", lg: "block" }}
            className="animate-float-slower"
          >
            <Box rounded="2xl" border="normal" borderColor="base" p="3" className="bg-raised/90 shadow-lg backdrop-blur">
              <Tag colorScheme="brand" variant="solid" size="sm">Shipped ✦</Tag>
            </Box>
          </Box>
          <Box
            position="absolute"
            bottom="-2rem"
            right="-1rem"
            display={{ base: "hidden", lg: "block" }}
            className="animate-float-slow"
            style={{ animationDelay: "1.6s" }}
          >
            <Flex
              alignItems="center"
              gap="2.5"
              rounded="2xl"
              border="normal"
              borderColor="base"
              px="4"
              py="3"
              className="bg-raised/90 shadow-lg backdrop-blur"
            >
              <Avatar name="Nova Starling" size="xs" />
              <Text as="span" size="xs" color="muted">
                Nova deployed{" "}
                <Text as="span" size="xs" weight="medium" color="brand-label">to production</Text>
              </Text>
            </Flex>
          </Box>
        </motion.div>
      </Grid>
    </Flex>
  );
}
