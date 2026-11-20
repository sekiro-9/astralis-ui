"use client";

import NextLink from "next/link";
import {
  Marquee, Button, Badge, Tag, Avatar, Switch, Checkbox, ThemeToggle, Code, HStack, Link,
  Box, Flex, Stack, Text,
} from "astralis-ui";
import { Reveal } from "./reveal";
import { SectionLead } from "./section-title";

/* Two opposing streams of real, rendered components. */
export function Showcase({ components, version }: { components: number; version: string }) {
  return (
    <Box
      as="section"
      borderT="normal"
      borderB="normal"
      borderColor="base"
      py={{ base: "24", lg: "28" }}
      // A translucent surface has no prop.
      className="bg-surface-subtle/50"
    >
      <Box mx="auto" maxW="7xl" px={{ base: "6", lg: "12" }}>
        <Reveal>
          <Flex mb="14" wrap="wrap" alignItems="end" justifyContent="between" gap="4">
            <Box>
              {/* Not SectionTitle: balancing this title would rewrap it on a phone. */}
              <Text as="h2" fontFamily="heading" size="4xl" weight="semibold" letterSpacing="tight" color="base">
                {components} components, all real
              </Text>
              <SectionLead>Nothing below is a screenshot. Hover to pause, then meet them in the docs.</SectionLead>
            </Box>
            <Link as={NextLink} href="/docs/components/button" variant="underline" size="sm" weight="medium">
              Component docs →
            </Link>
          </Flex>
        </Reveal>
      </Box>

      <Stack gap="6">
        <Marquee speed={38} gap="1.25rem" pauseOnHover gradient>
          <Marquee.Item><Button size="sm">Deploy</Button></Marquee.Item>
          <Marquee.Item><Tag colorScheme="purple" closable>Design</Tag></Marquee.Item>
          <Marquee.Item><Badge colorScheme="green" variant="solid">Active</Badge></Marquee.Item>
          <Marquee.Item><Switch defaultChecked size="sm">Notifications</Switch></Marquee.Item>
          <Marquee.Item>
            <Avatar.Group max={3} size="xs">
              <Avatar name="Nova Starling" />
              <Avatar name="Alex Kim" />
              <Avatar name="Maria Lopez" />
              <Avatar name="Sam Patel" />
            </Avatar.Group>
          </Marquee.Item>
          <Marquee.Item><Button size="sm" variant="outline" colorScheme="gray">Cancel</Button></Marquee.Item>
          <Marquee.Item><Code>pnpm add astralis-ui</Code></Marquee.Item>
          <Marquee.Item><Badge colorScheme="blue" variant="outline">Beta</Badge></Marquee.Item>
        </Marquee>

        <Marquee speed={38} gap="1.25rem" pauseOnHover gradient reverse>
          <Marquee.Item><Checkbox defaultChecked size="sm">Remember me</Checkbox></Marquee.Item>
          <Marquee.Item><Button size="sm" variant="subtle" colorScheme="teal">Invite team</Button></Marquee.Item>
          <Marquee.Item><Tag variant="outline" colorScheme="blue">v{version}</Tag></Marquee.Item>
          <Marquee.Item><ThemeToggle size="sm" /></Marquee.Item>
          <Marquee.Item><Badge colorScheme="orange">Pending</Badge></Marquee.Item>
          <Marquee.Item>
            <HStack gap="2">
              <Avatar name="Jo Ellis" size="xs" />
              <Tag size="sm" colorScheme="pink">@jo</Tag>
            </HStack>
          </Marquee.Item>
          <Marquee.Item><Button size="sm" variant="link">Read the changelog</Button></Marquee.Item>
          <Marquee.Item><Checkbox indeterminate size="sm">Select all</Checkbox></Marquee.Item>
        </Marquee>
      </Stack>
    </Box>
  );
}
