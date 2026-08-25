import {
  Alert,
  Backdrop,
  Collapsible,
  EmptyState,
  Popout,
  VisuallyHidden,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Menu,
  Progress,
  Separator,
  Skeleton,
  Spinner,
  Stack,
  Stat,
  Table,
  Tabs,
  Text,
  VStack,
} from "astralis-ui";

/**
 * RSC probe — the end-to-end proof that the server boundary works.
 *
 * This file is deliberately a SERVER Component (no "use client") and it
 * renders every zero-client component plus compound dot-access plus a client
 * compound. `next build` prerendering this page proves, in one shot, that:
 *
 * - server-safe components arrive as real functions (not client-reference
 *   stubs that render as `undefined` — the 0.7.1 failure mode),
 * - compound statics (`Card.Body`, `Table.Head`) resolve server-side, which
 *   the Object.assign compound assembly makes non-obvious across the boundary,
 * - client compounds (Menu, Tabs) still render from a server page as islands.
 *
 * Not linked from navigation and not in llms.txt — it exists for the build,
 * not for readers. If a hook or context sneaks into a "server" module, this
 * page fails the docs build before any consumer sees the regression.
 */
export const metadata = { title: "RSC probe", robots: { index: false } };

export default function RscProbePage() {
  return (
    <Container maxW="4xl" py="10">
      <VStack gap="8" alignItems="stretch">
        <Heading size="xl">RSC probe</Heading>
        <Text color="muted">
          Every component below rendered inside a Server Component. If this
          page built, the boundary holds.
        </Text>

        {/* Layout + typography (zero-client set) */}
        <Box p="4" bg="brand-subtle" rounded="lg">
          <Flex gap="4" wrap="wrap">
            <Center p="2">
              <Badge colorScheme="green">server</Badge>
            </Center>
            <Stack gap="2">
              <Text size="sm">Stack</Text>
              <Separator />
              <Text size="sm" color="muted">
                below the separator
              </Text>
            </Stack>
            <HStack gap="2">
              <Spinner size="sm" />
              <Skeleton w="16" h="4" />
            </HStack>
          </Flex>
          <Grid columns="3" gap="3" pt="4">
            <Progress value={30} />
            <Progress value={60} />
            <Progress value={90} />
          </Grid>
          <Alert status="info" mt="4">
            Alert renders server-side (its dismiss button only exists when a
            client passes onClose).
          </Alert>
        </Box>

        {/* Compound dot-access across the boundary */}
        <Card>
          <Card.Header>
            <Card.Title>Card.Title via dot access</Card.Title>
            <Card.Description>
              Undefined server-side in 0.7.1 — a real element now.
            </Card.Description>
          </Card.Header>
          <Card.Body>
            <Text size="sm">Card.Body content.</Text>
          </Card.Body>
          <Card.Footer>
            <Text size="sm" color="muted">
              Card.Footer content.
            </Text>
          </Card.Footer>
        </Card>

        <Table variant="outline">
          <Table.Header>
            <Table.Row>
              <Table.Head>Compound</Table.Head>
              <Table.Head>Resolves</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Table.Head / Table.Cell</Table.Cell>
              <Table.Cell>
                <Badge colorScheme="green">yes</Badge>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>

        <Stat>
          <Stat.Label>Stat.Label</Stat.Label>
          <Stat.Value>42</Stat.Value>
          <Stat.HelpText>dot access from a server page</Stat.HelpText>
        </Stat>

        {/* Zero-JS interactive: native details + popover/anchor — these ship
            NO JavaScript at all, yet open, close, and light-dismiss. */}
        <VStack gap="3" alignItems="stretch" data-probe="zero-js">
          <Collapsible name="probe-faq" defaultOpen>
            <Collapsible.Trigger>Zero-JS collapsible A</Collapsible.Trigger>
            <Collapsible.Content>Open state lives in the browser.</Collapsible.Content>
          </Collapsible>
          <Collapsible name="probe-faq">
            <Collapsible.Trigger>Zero-JS collapsible B (exclusive)</Collapsible.Trigger>
            <Collapsible.Content>Opening me closes A — native name grouping.</Collapsible.Content>
          </Collapsible>
          <HStack>
            <Popout>
              <Popout.Trigger>Zero-JS popout</Popout.Trigger>
              <Popout.Content side="bottom" align="start">
                Anchored by CSS, dismissed by the platform.
              </Popout.Content>
            </Popout>
          </HStack>
          <EmptyState size="sm">
            <EmptyState.Indicator>∅</EmptyState.Indicator>
            <EmptyState.Title>
              EmptyState renders server-side
              <VisuallyHidden> (and VisuallyHidden with it)</VisuallyHidden>
            </EmptyState.Title>
            <EmptyState.Description>Pure composition, zero client JS.</EmptyState.Description>
          </EmptyState>
          {/* Backdrop is fixed by design — scope it inside the probe box. */}
          <Box position="relative" h="10" overflow="hidden" rounded="md">
            <Backdrop className="astralis:absolute" />
          </Box>
        </VStack>

        {/* Client compounds as islands inside the server page */}
        <HStack gap="4">
          <Menu>
            <Menu.Trigger>
              <Button variant="outline" colorScheme="gray" size="sm">
                Client island
              </Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item>Menu hydrates</Menu.Item>
              <Menu.Item>the page does not</Menu.Item>
            </Menu.Content>
          </Menu>
        </HStack>

        <Tabs defaultValue="a">
          <Tabs.List>
            <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
            <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="a">
            <Text size="sm">Client compound rendered from a server page.</Text>
          </Tabs.Content>
          <Tabs.Content value="b">
            <Text size="sm">Second panel.</Text>
          </Tabs.Content>
        </Tabs>
      </VStack>
    </Container>
  );
}
