/**
 * The shared bench page, Astralis flavor. See bench/README.md for the spec.
 *
 * Deliberately a Server Component source: no "use client", no state, no
 * handlers anywhere except the single Menu island (which carries none either —
 * opening a menu is library-internal state). Whatever client JS the build
 * reports for this route is what the LIBRARY forces, not what the page asked
 * for.
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
  Separator,
  Stat,
  Table,
  Text,
  VStack,
} from "astralis-ui";

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
      <VStack gap="12" alignItems="stretch">
        {/* Hero */}
        <VStack gap="4" alignItems="start" maxW="2xl">
          <Badge colorScheme="purple">Status dashboard</Badge>
          <Heading size="3xl">Everything, at a glance</Heading>
          <Text size="lg" color="muted">
            A mostly-static operations overview: stats, cards, and a table.
            Exactly one interactive island lives on this page — the actions
            menu in the corner of the table section.
          </Text>
          <HStack gap="3">
            <Button>View report</Button>
            <Button variant="outline" colorScheme="gray">
              Share
            </Button>
          </HStack>
        </VStack>

        {/* Stats band */}
        <HStack gap="10" wrap="wrap">
          <Stat>
            <Stat.Label>Requests / min</Stat.Label>
            <Stat.Value>182k</Stat.Value>
            <Stat.HelpText>
              <Stat.Indicator type="increase">8.1%</Stat.Indicator> vs last week
            </Stat.HelpText>
          </Stat>
          <Stat>
            <Stat.Label>p95 latency</Stat.Label>
            <Stat.Value>142ms</Stat.Value>
            <Stat.HelpText>
              <Stat.Indicator type="decrease">11ms</Stat.Indicator> vs last week
            </Stat.HelpText>
          </Stat>
          <Stat>
            <Stat.Label>Error rate</Stat.Label>
            <Stat.Value>0.04%</Stat.Value>
            <Stat.HelpText>within budget</Stat.HelpText>
          </Stat>
          <Stat>
            <Stat.Label>Active regions</Stat.Label>
            <Stat.Value>6</Stat.Value>
            <Stat.HelpText>all healthy</Stat.HelpText>
          </Stat>
        </HStack>

        {/* Cards grid */}
        <Grid columns="3" gap="5">
          {cards.map((card) => (
            <Card key={card.title}>
              <Card.Header>
                <Card.Title>{card.title}</Card.Title>
                <Card.Description>{card.desc}</Card.Description>
              </Card.Header>
              <Card.Body>
                <Text size="sm" color="muted">
                  {card.body}
                </Text>
              </Card.Body>
              <Card.Footer>
                <Button variant="link" size="sm">
                  Details →
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </Grid>

        {/* Table + the one interactive island */}
        <VStack gap="4" alignItems="stretch">
          <HStack justifyContent="between">
            <Heading size="lg">Services</Heading>
            <Menu>
              <Menu.Trigger>
                <Button variant="outline" colorScheme="gray" size="sm">
                  Actions
                </Button>
              </Menu.Trigger>
              <Menu.Content>
                <Menu.Label>Table</Menu.Label>
                <Menu.Item>Export CSV</Menu.Item>
                <Menu.Item>Refresh</Menu.Item>
                <Menu.Separator />
                <Menu.Item danger>Reset filters</Menu.Item>
              </Menu.Content>
            </Menu>
          </HStack>
          <Table variant="outline" striped>
            <Table.Header>
              <Table.Row>
                <Table.Head>Service</Table.Head>
                <Table.Head>Region</Table.Head>
                <Table.Head>Uptime (30d)</Table.Head>
                <Table.Head>Status</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {services.map((service) => (
                <Table.Row key={service.name}>
                  <Table.Cell>{service.name}</Table.Cell>
                  <Table.Cell>{service.region}</Table.Cell>
                  <Table.Cell>{service.uptime}</Table.Cell>
                  <Table.Cell>
                    <Badge colorScheme={service.scheme}>{service.status}</Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Caption>Fleet status, refreshed at build time</Table.Caption>
          </Table>
        </VStack>

        {/* Footer */}
        <Box>
          <Separator />
          <HStack justifyContent="between" pt="6">
            <Text size="sm" color="muted">
              Built with Astralis UI
            </Text>
            <HStack gap="4">
              <Text size="sm" color="muted">
                Docs
              </Text>
              <Text size="sm" color="muted">
                Status history
              </Text>
              <Badge colorScheme="gray">v0.7.x</Badge>
            </HStack>
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
}
