"use client";

import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Blockquote,
  Box,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Code,
  Field,
  Flex,
  Grid,
  Heading,
  Icon,
  Input,
  Kbd,
  Pagination,
  Progress,
  Radio,
  Skeleton,
  Slider,
  Loader,
  Stack,
  Stat,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  Text,
  Textarea,
  Timeline,
} from "astralis-ui";
import { Check, Package, Truck } from "lucide-react";

/** The artboard's fixed design width. The canvas scales it visually. */
export const ARTBOARD_WIDTH = 1080;

function SheetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack as="section" gap="4">
      <Text size="xs" color="subtle" weight="medium" casing="uppercase" letterSpacing="wide">
        {title}
      </Text>
      {children}
    </Stack>
  );
}

/**
 * The page rendered inside the canvas: a product-dashboard mock followed by a
 * component sheet touching every category, all painting from the scoped vars.
 * No overlay components: portals escape the scoped-vars subtree.
 */
export function PreviewArtboard({ vars }: { vars: Record<string, string> }) {
  return (
    <Box
      data-theme-preview
      style={vars}
      overflow="hidden"
      rounded="2xl"
      border="normal"
      borderColor="base"
      bg="base"
      // The library's dark-mode shadow-lg is several times darker than this one.
      className="shadow-lg"
    >
      {/* App chrome */}
      <Flex alignItems="center" justifyContent="between" borderB="normal" borderColor="base" px="6" py="3">
        <Flex alignItems="center" gap="3">
          <Box as="span" size="6" rounded="lg" aria-hidden="true" bg="brand-solid" />
          <Heading as="h5" size="sm">
            Acme Cloud
          </Heading>
        </Flex>
        <Flex alignItems="center" gap="2">
          <Button variant="text" colorScheme="gray" size="sm">
            Docs
          </Button>
          <Button variant="outline" colorScheme="gray" size="sm">
            Feedback
          </Button>
          <Button size="sm">Upgrade</Button>
          <Avatar name="Ada Lovelace" size="sm" />
        </Flex>
      </Flex>

      <Stack gap="8" p="6">
        {/* -------- Page 1: a product dashboard -------- */}
        <Grid gap="6" columns={{ md: "2" }}>
          <Card variant="outline">
            <Card.Header extra={<Badge colorScheme="green">Live</Badge>}>
              <Card.Title>Monthly revenue</Card.Title>
              <Card.Description>Updated a minute ago</Card.Description>
            </Card.Header>
            <Card.Body>
              <Stat>
                <Stat.Label>MRR</Stat.Label>
                <Stat.Value>$48,210</Stat.Value>
                <Stat.HelpText>
                  <Stat.Indicator type="increase" />
                  12.4% from last month
                </Stat.HelpText>
              </Stat>
              <Box mt="4">
                <Progress value={72} aria-label="Quota used" />
              </Box>
            </Card.Body>
          </Card>

          <Card variant="outline">
            <Card.Header>
              <Card.Title>Invite a teammate</Card.Title>
            </Card.Header>
            <Card.Body>
              <Stack gap="4">
                <Field>
                  <Field.Label>Email</Field.Label>
                  <Input placeholder="ada@example.com" />
                </Field>
                <Flex alignItems="center" justifyContent="between">
                  <Checkbox defaultChecked>Send a copy to me</Checkbox>
                  <Switch defaultChecked aria-label="Admin access" />
                </Flex>
                <Flex gap="2">
                  <Button>Send invite</Button>
                  <Button variant="outline" colorScheme="gray">
                    Cancel
                  </Button>
                </Flex>
              </Stack>
            </Card.Body>
          </Card>
        </Grid>

        <Alert status="info">
          <Alert.Title>Theme applied</Alert.Title>
          <Alert.Description>Every component below paints from your tokens.</Alert.Description>
        </Alert>

        {/* -------- Page 2: one or two components from every category -------- */}
        <Grid gap="8" columns={{ md: "2" }}>
          <SheetSection title="Buttons">
            <Flex wrap="wrap" alignItems="center" gap="2">
              <Button>Solid</Button>
              <Button variant="subtle">Subtle</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="text">Text</Button>
              <Button colorScheme="red" variant="subtle">
                Delete
              </Button>
            </Flex>
          </SheetSection>

          <SheetSection title="Typography">
            <Stack gap="2">
              <Heading size="md">The quick brown fox</Heading>
              <Text size="sm" color="muted">
                Body text with <Code>inline code</Code> and a shortcut <Kbd>⌘K</Kbd>.
              </Text>
              <Blockquote cite="Ada Lovelace">That brain of mine is more than merely mortal.</Blockquote>
            </Stack>
          </SheetSection>

          <SheetSection title="Data entry">
            <Stack gap="4">
              <Radio.Group defaultValue="pro" aria-label="Plan">
                <Radio value="free">Free</Radio>
                <Radio value="pro">Pro</Radio>
                <Radio value="team">Team</Radio>
              </Radio.Group>
              <Slider defaultValue={40} aria-label="Volume" />
              <Textarea placeholder="Leave a note…" rows={2} />
            </Stack>
          </SheetSection>

          <SheetSection title="Navigation">
            <Stack gap="5">
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Breadcrumb.Link href="#">Projects</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Breadcrumb.Link isCurrent>Astralis</Breadcrumb.Link>
                </Breadcrumb.Item>
              </Breadcrumb>
              <Steps step={1}>
                <Steps.List>
                  <Steps.Item>
                    <Steps.Indicator />
                    <Steps.Title>Account</Steps.Title>
                  </Steps.Item>
                  <Steps.Item>
                    <Steps.Indicator />
                    <Steps.Title>Shipping</Steps.Title>
                  </Steps.Item>
                  <Steps.Item>
                    <Steps.Indicator />
                    <Steps.Title>Confirm</Steps.Title>
                  </Steps.Item>
                </Steps.List>
              </Steps>
              <Pagination totalPages={8} defaultPage={3}>
                <Pagination.List>
                  <Pagination.Prev />
                  <Pagination.Pages />
                  <Pagination.Next />
                </Pagination.List>
              </Pagination>
            </Stack>
          </SheetSection>

          <SheetSection title="Disclosure & tabs">
            <Tabs defaultValue="one" variant="segmented" fitted>
              <Tabs.List aria-label="Example tabs">
                <Tabs.Trigger value="one">First</Tabs.Trigger>
                <Tabs.Trigger value="two">Second</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="one">
                <Box pt="3">
                  <Accordion type="single" defaultValue="a" collapsible>
                    <Accordion.Item value="a">
                      <Accordion.Trigger>Semantic tokens</Accordion.Trigger>
                      <Accordion.Content>
                        Named colors that resolve differently per theme.
                      </Accordion.Content>
                    </Accordion.Item>
                    <Accordion.Item value="b">
                      <Accordion.Trigger>Build step</Accordion.Trigger>
                      <Accordion.Content>None: precompiled CSS.</Accordion.Content>
                    </Accordion.Item>
                  </Accordion>
                </Box>
              </Tabs.Content>
              <Tabs.Content value="two">
                <Box pt="3">
                  <Text size="sm" color="muted">
                    Second panel.
                  </Text>
                </Box>
              </Tabs.Content>
            </Tabs>
          </SheetSection>

          <SheetSection title="Feedback">
            <Stack gap="4">
              <Flex alignItems="center" gap="4">
                <Loader size="sm" />
                <Progress value={64} aria-label="Upload" flex="1" />
              </Flex>
              <Flex alignItems="center" gap="3">
                <Skeleton variant="circle" w="10" h="10" shrink="0" />
                <Stack flex="1" gap="2">
                  <Skeleton variant="text" w="3/4" />
                  <Skeleton variant="text" />
                </Stack>
              </Flex>
            </Stack>
          </SheetSection>

          <SheetSection title="Data display">
            <Table variant="outline" striped>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Version</Table.Head>
                  <Table.Head>Status</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>0.1.3</Table.Cell>
                  <Table.Cell>
                    <Badge colorScheme="green">Stable</Badge>
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>0.1.2</Table.Cell>
                  <Table.Cell>
                    <Badge colorScheme="orange">Deprecated</Badge>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </SheetSection>

          <SheetSection title="Timeline & tags">
            <Stack gap="4">
              <Flex gap="1.5">
                <Tag colorScheme="brand">design</Tag>
                <Tag colorScheme="teal">tokens</Tag>
                <Tag colorScheme="gray">beta</Tag>
              </Flex>
              <Timeline>
                <Timeline.Item>
                  <Timeline.Indicator colorScheme="green">
                    <Icon as={Check} size="xs" />
                  </Timeline.Indicator>
                  <Timeline.Content>
                    <Timeline.Title>Order placed</Timeline.Title>
                    <Timeline.Description>Confirmed at 2:30 PM</Timeline.Description>
                  </Timeline.Content>
                </Timeline.Item>
                <Timeline.Item>
                  <Timeline.Indicator>
                    <Icon as={Truck} size="xs" />
                  </Timeline.Indicator>
                  <Timeline.Content>
                    <Timeline.Title>Shipped</Timeline.Title>
                  </Timeline.Content>
                </Timeline.Item>
                <Timeline.Item>
                  <Timeline.Indicator>
                    <Icon as={Package} size="xs" />
                  </Timeline.Indicator>
                  <Timeline.Content>
                    <Timeline.Title>Delivered</Timeline.Title>
                  </Timeline.Content>
                </Timeline.Item>
              </Timeline>
            </Stack>
          </SheetSection>
        </Grid>

        <Text size="xs" color="subtle">
          Overlay components (Modal, Drawer, Popover, Tooltip, Toast) render in portals outside
          this canvas. They use the same tokens.
        </Text>
      </Stack>
    </Box>
  );
}
