/**
 * The shared bench page, Radix Themes flavor. See bench/README.md for the spec.
 *
 * Deliberately a Server Component with no "use client": Radix Themes ships
 * per-component client boundaries, so its static components (Card, Text,
 * Badge, Table, layout) render on the server. This flavor exists precisely
 * to measure the one surveyed library that partitions its surface the way
 * this project does — the comparison that matters most.
 *
 * Radix Themes has no Stat component, so the statistics band is composed from
 * Heading and Text, as in the shadcn flavor.
 */
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  DropdownMenu,
  Flex,
  Grid,
  Heading,
  Separator,
  Table,
  Text,
} from "@radix-ui/themes";

const services = [
  { name: "API gateway", region: "us-east-1", uptime: "99.99%", status: "Operational", color: "green" as const },
  { name: "Auth service", region: "us-east-1", uptime: "99.97%", status: "Operational", color: "green" as const },
  { name: "Billing", region: "eu-west-2", uptime: "99.95%", status: "Operational", color: "green" as const },
  { name: "Search index", region: "us-west-1", uptime: "99.90%", status: "Degraded", color: "orange" as const },
  { name: "Media CDN", region: "global", uptime: "100%", status: "Operational", color: "green" as const },
  { name: "Webhooks", region: "us-east-2", uptime: "99.80%", status: "Degraded", color: "orange" as const },
  { name: "Analytics", region: "eu-central-1", uptime: "99.99%", status: "Operational", color: "green" as const },
  { name: "Backups", region: "us-east-1", uptime: "100%", status: "Operational", color: "green" as const },
];

const cards = [
  { title: "Deployments", desc: "Continuous delivery pipeline", body: "14 deploys this week across 3 environments. Median lead time 11 minutes." },
  { title: "Error budget", desc: "SLO 99.9% · 30-day window", body: "62% of the budget remaining. Largest burn: search index brownout on Tuesday." },
  { title: "Incidents", desc: "Last 90 days", body: "2 minor incidents, both auto-remediated. Mean time to recovery 8 minutes." },
  { title: "On-call", desc: "This rotation", body: "Riley is primary, Sam is backup. 3 pages this week, none overnight." },
  { title: "Capacity", desc: "Fleet utilization", body: "CPU 54%, memory 61%. Autoscaler added 6 nodes during Monday's spike." },
  { title: "Costs", desc: "Month to date", body: "$12,480 — tracking 4% under forecast. Biggest line: media CDN egress." },
];

const stats = [
  { label: "Requests / min", value: "182k", help: "+8.1% vs last week" },
  { label: "p95 latency", value: "142ms", help: "-11ms vs last week" },
  { label: "Error rate", value: "0.04%", help: "within budget" },
  { label: "Active regions", value: "6", help: "all healthy" },
];

export default function BenchPage() {
  return (
    <Container size="4" py="8">
      <Flex direction="column" gap="8">
        {/* Hero */}
        <Flex direction="column" gap="3" align="start" maxWidth="640px">
          <Badge color="purple">Status dashboard</Badge>
          <Heading size="8">Everything, at a glance</Heading>
          <Text size="4" color="gray">
            A mostly-static operations overview: stats, cards, and a table.
            Exactly one interactive island lives on this page — the actions
            menu in the corner of the table section.
          </Text>
          <Flex gap="3">
            <Button>View report</Button>
            <Button variant="outline" color="gray">
              Share
            </Button>
          </Flex>
        </Flex>

        {/* Stats band */}
        <Flex gap="8" wrap="wrap">
          {stats.map((stat) => (
            <Box key={stat.label}>
              <Text size="2" color="gray" as="p">
                {stat.label}
              </Text>
              <Heading size="7">{stat.value}</Heading>
              <Text size="2" color="gray" as="p">
                {stat.help}
              </Text>
            </Box>
          ))}
        </Flex>

        {/* Cards grid */}
        <Grid columns="3" gap="4">
          {cards.map((card) => (
            <Card key={card.title}>
              <Flex direction="column" gap="2">
                <Heading size="3">{card.title}</Heading>
                <Text size="2" color="gray">
                  {card.desc}
                </Text>
                <Text size="2" color="gray">
                  {card.body}
                </Text>
                <Text size="2">Details →</Text>
              </Flex>
            </Card>
          ))}
        </Grid>

        {/* Table + the one interactive island */}
        <Flex direction="column" gap="3">
          <Flex justify="between" align="center">
            <Heading size="6">Services</Heading>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="outline" color="gray" size="1">
                  Actions
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item>Export CSV</DropdownMenu.Item>
                <DropdownMenu.Item>Refresh</DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item color="red">Reset filters</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Service</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Region</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Uptime (30d)</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {services.map((service) => (
                <Table.Row key={service.name}>
                  <Table.Cell>{service.name}</Table.Cell>
                  <Table.Cell>{service.region}</Table.Cell>
                  <Table.Cell>{service.uptime}</Table.Cell>
                  <Table.Cell>
                    <Badge color={service.color}>{service.status}</Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Flex>

        {/* Footer */}
        <Box>
          <Separator size="4" />
          <Flex justify="between" pt="4">
            <Text size="2" color="gray">
              Built with Radix Themes
            </Text>
            <Flex gap="4" align="center">
              <Text size="2" color="gray">
                Docs
              </Text>
              <Text size="2" color="gray">
                Status history
              </Text>
              <Badge color="gray">v3.x</Badge>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
}
