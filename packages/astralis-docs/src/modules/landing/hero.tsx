"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  useTheme,
  Button, Card, Stat, Badge, Avatar, Switch, Slider, Tag, HStack, VStack,
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
    <section
      // The header is h-14 (3.5rem): the hero fills the rest of the first screen,
      // up to 60rem so very tall monitors do not get a mostly empty hero.
      className="relative isolate flex items-center overflow-hidden lg:min-h-[min(calc(100svh-3.5rem),60rem)]"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <BrandScene fade="left" />
        <div className="hero-veil absolute inset-0" />
      </div>

      <div className="mx-auto grid w-full max-w-screen-xl items-center gap-16 px-6 py-12 lg:grid-cols-2 lg:px-14 lg:py-16">
        <div className="flex min-w-0 flex-col items-start">
          <Entrance delay={0}>
            <h1 className="font-display text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-tight text-label min-[420px]:text-5xl sm:text-6xl">
              Interfaces with a<br />
              <span className="text-gradient">stellar finish</span>
            </h1>
          </Entrance>

          <Entrance delay={0.08}>
            <p className="mt-8 max-w-lg text-pretty text-base leading-relaxed text-label-muted">
              Accessible, themeable React components for crafting polished web apps and
              design systems. Server-first, built for the Next.js RSC
            </p>
          </Entrance>

          <Entrance delay={0.16}>
            <div className="mt-10 flex flex-wrap items-center gap-2.5" role="group" aria-label="Try a brand color">
              {swatches.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  aria-label={`Brand color ${swatch.name}`}
                  aria-pressed={brand === swatch.hex}
                  onClick={() => setBrand(swatch.hex)}
                  className={`size-9 cursor-pointer rounded-full transition-all duration-200 hover:scale-115 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ring ${
                    brand === swatch.hex
                      ? "scale-110 ring-2 ring-accent-ring ring-offset-2 ring-offset-surface"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              ))}
              <label className="relative ml-1 flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-stroke-base bg-surface/40 text-label-muted backdrop-blur transition-all duration-200 hover:scale-110 hover:text-label">
                <span className="text-base leading-none">+</span>
                <input
                  type="color"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  aria-label="Pick a custom brand color"
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
              <span className="ml-2 font-mono text-xs tabular-nums text-label-subtle">{brand}</span>
            </div>
          </Entrance>

          <Entrance delay={0.24}>
            <div className="mt-12 flex flex-wrap gap-4">
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
            </div>

            <div className="mt-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="shrink-0">
                <CopyCommand command="npx astralis-cli create my-app" />
              </div>
              <span className="text-xs text-label-subtle sm:whitespace-nowrap">
                Scaffold your React project ·{" "}
                <Link href="/docs/cli" className="underline underline-offset-2 hover:text-label-muted">
                  How the CLI works
                </Link>
              </span>
            </div>
          </Entrance>
        </div>

        {/* Live composition: floats over the scene; every accent tracks the brand */}
        <motion.div
          className="relative lg:pl-6"
          initial={{ opacity: 0, y: 40, rotate: 1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={cardTransition}
        >
          <div className="animate-float-slow">
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
          </div>

          <div className="animate-float-slower absolute -left-8 -top-6 hidden lg:block">
            <div className="rounded-2xl border border-stroke-base bg-raised/90 p-3 shadow-lg backdrop-blur">
              <Tag colorScheme="brand" variant="solid" size="sm">Shipped ✦</Tag>
            </div>
          </div>
          <div className="animate-float-slow absolute -bottom-8 -right-4 hidden lg:block" style={{ animationDelay: "1.6s" }}>
            <div className="flex items-center gap-2.5 rounded-2xl border border-stroke-base bg-raised/90 px-4 py-3 shadow-lg backdrop-blur">
              <Avatar name="Nova Starling" size="xs" />
              <span className="text-xs text-label-muted">Nova deployed <span className="font-medium text-accent-label">to production</span></span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
