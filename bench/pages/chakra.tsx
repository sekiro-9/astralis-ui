"use client";

/**
 * The shared bench page, Chakra v3 flavor. See bench/README.md for the spec.
 *
 * The "use client" directive is REQUIRED: like astralis-ui 0.7.1, Chakra's
 * compound dot-access (Card.Root, Stat.Label, Table.Row) resolves to
 * undefined inside a Server Component, so a page composing compounds cannot
 * prerender without going client. That fact is itself a bench finding.
 */
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Heading,
  HStack,
  Menu,
  Portal,
  Separator,
  Stat,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";

const services = [
  { name: "API gateway", region: "us-east-1", uptime: "99.99%", status: "Operational", scheme: "green" },
  { name: "Auth service", region: "us-east-1", uptime: "99.97%", status: "Operational", scheme: "green" },
  { name: "Billing", region: "eu-west-2", uptime: "99.95%", status: "Operational", scheme: "green" },
  { name: "Search index", region: "us-west-1", uptime: "99.90%", status: "Degraded", scheme: "orange" },
  { name: "Media CDN", region: "global", uptime: "100%", status: "Operational", scheme: "green" },
  { name: "Webhooks", region: "us-east-2", uptime: "99.80%", status: "Degraded", scheme: "orange" },
  { name: "Analytics", region: "eu-central-1", uptime: "99.99%", status: "Operational", scheme: "green" },
  { name: "Backups", region: "us-east-1", uptime: "100%", status: "Operational", scheme: "green" },
] as const;

const cards = [
  { title: "Deployments", desc: "Continuous delivery pipeline", body: "14 deploys this week across 3 environments. Median lead time 11 minutes." },
  { title: "Error budget", desc: "SLO 99.9% · 30-day window", body: "62% of the budget remaining. Largest burn: search index brownout on Tuesday." },
  { title: "Incidents", desc: "Last 90 days", body: "2 minor incidents, both auto-remediated. Mean time to recovery 8 minutes." },
  { title: "On-call", desc: "This rotation", body: "Riley is primary, Sam is backup. 3 pages this week, none overnight." },
  { title: "Capacity", desc: "Fleet utilization", body: "CPU 54%, memory 61%. Autoscaler added 6 nodes during Monday's spike." },
  { title: "Costs", desc: "Month to date", body: "$12,480 — tracking 4% under forecast. Biggest line: media CDN egress." },
] as const;

export default function BenchPage() {
  return (
    <Container maxW="6xl" py="12">
      <VStack gap="12" align="stretch">
        {/* Hero */}
        <VStack gap="4" align="flex-start" maxW="2xl">
          <Badge colorPalette="purple">Status dashboard</Badge>
          <Heading size="3xl">Everything, at a glance</Heading>
          <Text fontSize="lg" color="fg.muted">
            A mostly-static operations overview: stats, cards, and a table.
            Exactly one interactive island lives on this page — the actions
            menu in the corner of the table section.
          </Text>
          <HStack gap="3">
            <Button>View report</Button>
            <Button variant="outline" colorPalette="gray">
              Share
            </Button>
          </HStack>
        </VStack>

        {/* Stats band */}
        <HStack gap="10" wrap="wrap">
          <Stat.Root>
            <Stat.Label>Requests / min</Stat.Label>
            <Stat.ValueText>182k</Stat.ValueText>
            <Stat.HelpText>+8.1% vs last week</Stat.HelpText>
          </Stat.Root>
          <Stat.Root>
            <Stat.Label>p95 latency</Stat.Label>
            <Stat.ValueText>142ms</Stat.ValueText>
            <Stat.HelpText>-11ms vs last week</Stat.HelpText>
          </Stat.Root>
          <Stat.Root>
            <Stat.Label>Error rate</Stat.Label>
            <Stat.ValueText>0.04%</Stat.ValueText>
            <Stat.HelpText>within budget</Stat.HelpText>
          </Stat.Root>
          <Stat.Root>
            <Stat.Label>Active regions</Stat.Label>
            <Stat.ValueText>6</Stat.ValueText>
            <Stat.HelpText>all healthy</Stat.HelpText>
          </Stat.Root>
        </HStack>

        {/* Cards grid */}
        <Grid templateColumns="repeat(3, 1fr)" gap="5">
          {cards.map((card) => (
            <Card.Root key={card.title}>
              <Card.Header>
                <Card.Title>{card.title}</Card.Title>
                <Card.Description>{card.desc}</Card.Description>
              </Card.Header>
              <Card.Body>
                <Text fontSize="sm" color="fg.muted">
                  {card.body}
                </Text>
              </Card.Body>
              <Card.Footer>
                <Button variant="plain" size="sm">
                  Details →
                </Button>
              </Card.Footer>
            </Card.Root>
          ))}
        </Grid>

        {/* Table + the one interactive island */}
        <VStack gap="4" align="stretch">
          <HStack justify="space-between">
            <Heading size="lg">Services</Heading>
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button variant="outline" colorPalette="gray" size="sm">
                  Actions
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item value="export">Export CSV</Menu.Item>
                    <Menu.Item value="refresh">Refresh</Menu.Item>
                    <Menu.Separator />
                    <Menu.Item value="reset">Reset filters</Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </HStack>
          <Table.Root variant="outline" striped>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Service</Table.ColumnHeader>
                <Table.ColumnHeader>Region</Table.ColumnHeader>
                <Table.ColumnHeader>Uptime (30d)</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {services.map((service) => (
                <Table.Row key={service.name}>
                  <Table.Cell>{service.name}</Table.Cell>
                  <Table.Cell>{service.region}</Table.Cell>
                  <Table.Cell>{service.uptime}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={service.scheme}>{service.status}</Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Caption>Fleet status, refreshed at build time</Table.Caption>
          </Table.Root>
        </VStack>

        {/* Footer */}
        <Box>
          <Separator />
          <HStack justify="space-between" pt="6">
            <Text fontSize="sm" color="fg.muted">
              Built with Chakra UI
            </Text>
            <HStack gap="4">
              <Text fontSize="sm" color="fg.muted">
                Docs
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Status history
              </Text>
              <Badge colorPalette="gray">v3.x</Badge>
            </HStack>
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
}
