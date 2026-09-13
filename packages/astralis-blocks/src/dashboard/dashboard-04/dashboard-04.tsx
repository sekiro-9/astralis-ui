import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Stack,
  Table,
  Tabs,
  Text,
} from "astralis-ui";

type Status = "paid" | "pending" | "refunded";

const orders: {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: Status;
  amount: string;
}[] = [
  { id: "#3210", customer: "Ada Lovelace", email: "ada@analytical.dev", date: "Sep 22", status: "paid", amount: "$1,240.00" },
  { id: "#3209", customer: "Grace Hopper", email: "grace@cobol.io", date: "Sep 22", status: "pending", amount: "$89.00" },
  { id: "#3208", customer: "Alan Turing", email: "alan@bombe.co.uk", date: "Sep 21", status: "paid", amount: "$460.50" },
  { id: "#3207", customer: "Katherine Johnson", email: "kj@orbit.space", date: "Sep 21", status: "refunded", amount: "$120.00" },
  { id: "#3206", customer: "Linus Pauling", email: "linus@bonds.org", date: "Sep 20", status: "paid", amount: "$2,015.00" },
  { id: "#3205", customer: "Hedy Lamarr", email: "hedy@hopping.fm", date: "Sep 19", status: "pending", amount: "$312.75" },
];

const statuses: Record<Status, { label: string; scheme: "success" | "warning" | "gray" }> = {
  paid: { label: "Paid", scheme: "success" },
  pending: { label: "Pending", scheme: "warning" },
  refunded: { label: "Refunded", scheme: "gray" },
};

const views = [
  { value: "all", label: "All", rows: orders },
  ...(Object.keys(statuses) as Status[]).map((status) => ({
    value: status,
    label: statuses[status].label,
    rows: orders.filter((order) => order.status === status),
  })),
];

function OrdersTable({ rows }: { rows: typeof orders }) {
  return (
    // Scrolls sideways inside the card on narrow screens instead of widening the page.
    <Box overflowX="auto">
      <Table size="sm" interactive>
        <Table.Header>
          <Table.Row>
            <Table.Head>Order</Table.Head>
            <Table.Head>Customer</Table.Head>
            <Table.Head>Date</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head style={{ textAlign: "right" }}>Amount</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((order) => (
            <Table.Row key={order.id}>
              <Table.Cell>
                <Text as="span" size="sm" weight="medium">
                  {order.id}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Flex alignItems="center" gap="3">
                  <Avatar name={order.customer} size="sm" />
                  <Stack direction="vertical">
                    <Text as="span" size="sm" weight="medium" lineHeight="tight">
                      {order.customer}
                    </Text>
                    <Text as="span" size="xs" color="muted" lineHeight="tight">
                      {order.email}
                    </Text>
                  </Stack>
                </Flex>
              </Table.Cell>
              <Table.Cell>
                <Text as="span" size="sm" color="muted">
                  {order.date}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Badge variant="subtle" colorScheme={statuses[order.status].scheme}>
                  {statuses[order.status].label}
                </Badge>
              </Table.Cell>
              <Table.Cell style={{ textAlign: "right" }}>
                <Text as="span" size="sm" weight="medium">
                  {order.amount}
                </Text>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Box>
  );
}

/**
 * Dashboard content, not a shell: drop it into the content region of any of
 * the dashboard shells. Tabs filter the orders by status, each trigger
 * carrying its count, and every panel is the same table over a different
 * slice of the data.
 *
 * Nothing here holds state. Tabs manages its own selection, so the block stays
 * a Server Component; swap `orders` for your own query.
 */
export function Dashboard04() {
  return (
    <Box as="section" bg="subtle" p={{ base: "4", lg: "8" }}>
      <Stack direction="vertical" alignItems="stretch" gap="6">
        <Flex
          direction={{ base: "column", sm: "row" }}
          alignItems={{ base: "start", sm: "end" }}
          justifyContent="between"
          gap="4"
        >
          <Stack direction="vertical" gap="1">
            <Heading as="h1" size="2xl" weight="semibold" letterSpacing="tight">
              Orders
            </Heading>
            <Text size="sm" color="muted">
              Every order from the last 7 days, newest first.
            </Text>
          </Stack>
          <Flex alignItems="center" gap="2">
            <Button size="sm" variant="outline" colorScheme="gray">
              Export CSV
            </Button>
            <Button size="sm">New order</Button>
          </Flex>
        </Flex>

        <Card variant="outline">
          <Tabs defaultValue="all" variant="line" size="sm">
            <Box px="4" pt="2">
              <Tabs.List aria-label="Filter orders by status">
                {views.map((view) => (
                  <Tabs.Trigger key={view.value} value={view.value}>
                    <Flex as="span" alignItems="center" gap="2">
                      {view.label}
                      <Badge size="xs" variant="subtle" colorScheme="gray">
                        {view.rows.length}
                      </Badge>
                    </Flex>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </Box>
            {views.map((view) => (
              <Tabs.Content key={view.value} value={view.value}>
                <OrdersTable rows={view.rows} />
              </Tabs.Content>
            ))}
          </Tabs>
        </Card>
      </Stack>
    </Box>
  );
}
