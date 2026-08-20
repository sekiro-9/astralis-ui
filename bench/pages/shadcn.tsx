/**
 * The shared bench page, shadcn/ui flavor. See bench/README.md for the spec.
 *
 * A Server Component: shadcn's static components (button, badge, card,
 * table) are plain copied-in functions, so they render server-side and ship
 * zero JS — the copy-paste model's genuine advantage. The interactive island
 * is Radix's DropdownMenu, a client primitive. Layout is raw Tailwind: shadcn
 * has no layout/typography components, which is itself a data point for the
 * comparison (the composition below hand-rolls what the other flavors get as
 * components).
 */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const services = [
  { name: "API gateway", region: "us-east-1", uptime: "99.99%", status: "Operational", variant: "secondary" as const },
  { name: "Auth service", region: "us-east-1", uptime: "99.97%", status: "Operational", variant: "secondary" as const },
  { name: "Billing", region: "eu-west-2", uptime: "99.95%", status: "Operational", variant: "secondary" as const },
  { name: "Search index", region: "us-west-1", uptime: "99.90%", status: "Degraded", variant: "outline" as const },
  { name: "Media CDN", region: "global", uptime: "100%", status: "Operational", variant: "secondary" as const },
  { name: "Webhooks", region: "us-east-2", uptime: "99.80%", status: "Degraded", variant: "outline" as const },
  { name: "Analytics", region: "eu-central-1", uptime: "99.99%", status: "Operational", variant: "secondary" as const },
  { name: "Backups", region: "us-east-1", uptime: "100%", status: "Operational", variant: "secondary" as const },
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
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-12">
        {/* Hero */}
        <div className="flex max-w-2xl flex-col items-start gap-4">
          <Badge variant="secondary">Status dashboard</Badge>
          <h1 className="text-4xl font-bold tracking-tight">Everything, at a glance</h1>
          <p className="text-lg text-muted-foreground">
            A mostly-static operations overview: stats, cards, and a table.
            Exactly one interactive island lives on this page — the actions
            menu in the corner of the table section.
          </p>
          <div className="flex gap-3">
            <Button>View report</Button>
            <Button variant="outline">Share</Button>
          </div>
        </div>

        {/* Stats band */}
        <div className="flex flex-wrap gap-10">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              <div className="text-3xl font-semibold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.help}</div>
            </div>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-3 gap-5">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.body}</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" size="sm" className="px-0">
                  Details →
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Table + the one interactive island */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Services</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export CSV</DropdownMenuItem>
                <DropdownMenuItem>Refresh</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Reset filters</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Uptime (30d)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.name}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.region}</TableCell>
                  <TableCell>{service.uptime}</TableCell>
                  <TableCell>
                    <Badge variant={service.variant}>{service.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption>Fleet status, refreshed at build time</TableCaption>
          </Table>
        </div>

        {/* Footer */}
        <div>
          <div className="border-t" />
          <div className="flex justify-between pt-6">
            <p className="text-sm text-muted-foreground">Built with shadcn/ui</p>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">Docs</p>
              <p className="text-sm text-muted-foreground">Status history</p>
              <Badge variant="outline">2026</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
