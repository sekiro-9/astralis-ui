/**
 * The shared bench page, MUI (Material UI v7) flavor. See bench/README.md.
 *
 * The page file itself can stay a Server Component (MUI's exports are flat,
 * so there is no dot-access stub problem), but every component here is
 * client-marked by the library, so the whole tree hydrates regardless. The
 * menu island lives in ./menu-island.tsx because MUI's Menu is imperative
 * (anchorEl state is the consumer's job).
 */
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import { MenuIsland } from "./menu-island";

const services = [
  { name: "API gateway", region: "us-east-1", uptime: "99.99%", status: "Operational", color: "success" as const },
  { name: "Auth service", region: "us-east-1", uptime: "99.97%", status: "Operational", color: "success" as const },
  { name: "Billing", region: "eu-west-2", uptime: "99.95%", status: "Operational", color: "success" as const },
  { name: "Search index", region: "us-west-1", uptime: "99.90%", status: "Degraded", color: "warning" as const },
  { name: "Media CDN", region: "global", uptime: "100%", status: "Operational", color: "success" as const },
  { name: "Webhooks", region: "us-east-2", uptime: "99.80%", status: "Degraded", color: "warning" as const },
  { name: "Analytics", region: "eu-central-1", uptime: "99.99%", status: "Operational", color: "success" as const },
  { name: "Backups", region: "us-east-1", uptime: "100%", status: "Operational", color: "success" as const },
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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={6}>
        {/* Hero */}
        <Stack spacing={2} sx={{ maxWidth: 640 }} alignItems="flex-start">
          <Chip label="Status dashboard" color="secondary" size="small" />
          <Typography variant="h3" component="h1">
            Everything, at a glance
          </Typography>
          <Typography variant="body1" color="text.secondary">
            A mostly-static operations overview: stats, cards, and a table.
            Exactly one interactive island lives on this page — the actions
            menu in the corner of the table section.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button variant="contained">View report</Button>
            <Button variant="outlined" color="inherit">
              Share
            </Button>
          </Stack>
        </Stack>

        {/* Stats band */}
        <Stack direction="row" spacing={5} flexWrap="wrap" useFlexGap>
          {stats.map((stat) => (
            <Box key={stat.label}>
              <Typography variant="overline" color="text.secondary">
                {stat.label}
              </Typography>
              <Typography variant="h4">{stat.value}</Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.help}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Cards grid */}
        <Grid container spacing={2.5}>
          {cards.map((card) => (
            <Grid key={card.title} size={4}>
              <Card variant="outlined">
                <CardHeader title={card.title} subheader={card.desc} />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {card.body}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Details →</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Table + the one interactive island */}
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="h2">
              Services
            </Typography>
            <MenuIsland />
          </Stack>
          <TableContainer component={Paper} variant="outlined">
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Region</TableCell>
                  <TableCell>Uptime (30d)</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service, i) => (
                  <TableRow key={service.name} sx={{ backgroundColor: i % 2 ? "action.hover" : undefined }}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.region}</TableCell>
                    <TableCell>{service.uptime}</TableCell>
                    <TableCell>
                      <Chip label={service.status} color={service.color} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        {/* Footer */}
        <Box>
          <Divider />
          <Stack direction="row" justifyContent="space-between" sx={{ pt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Built with MUI
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Docs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status history
              </Typography>
              <Chip label="v7.x" size="small" />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
