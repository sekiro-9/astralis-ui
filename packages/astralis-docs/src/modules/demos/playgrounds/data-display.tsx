import {
  Avatar,
  Badge,
  Card,
  DataList,
  Image,
  Marquee,
  QrCode,
  Stat,
  Table,
  Tag,
  Timeline,
} from "astralis-ui";
import { avatarProps } from "../avatar/avatar-props";
import { badgeProps } from "../badge/badge-props";
import { cardProps } from "../card/card-props";
import { dataListProps } from "../data-list/data-list-props";
import { imageProps } from "../image/image-props";
import { marqueeProps } from "../marquee/marquee-props";
import { qrCodeProps } from "../qr-code/qr-code-props";
import { statProps } from "../stat/stat-props";
import { tableProps } from "../table/table-props";
import { tagProps } from "../tag/tag-props";
import { timelineProps } from "../timeline/timeline-props";
import { asEntry, definePlaygrounds } from "./define";

export const dataDisplayPlaygrounds = definePlaygrounds({
  "badge-demo": {
    tag: "Badge",
    component: asEntry(Badge),
    rows: badgeProps,
    children: "Active",
    childrenLabel: "Label",
  },
  "tag-demo": {
    tag: "Tag",
    component: asEntry(Tag),
    rows: tagProps,
    children: "Design",
    childrenLabel: "Label",
  },
  "avatar-demo": { tag: "Avatar", component: asEntry(Avatar), rows: avatarProps },
  "card-demo": {
    tag: "Card",
    component: asEntry(Card),
    rows: cardProps,
    fixture: (
      <>
        <Card.Header>
          <Card.Title>Production cluster</Card.Title>
          <Card.Description>us-east-1 · 12 nodes</Card.Description>
        </Card.Header>
        <Card.Body>All services healthy.</Card.Body>
      </>
    ),
  },
  "data-list-demo": {
    tag: "DataList",
    component: asEntry(DataList),
    rows: dataListProps,
    fixture: (
      <>
        <DataList.Item>
          <DataList.Label>Name</DataList.Label>
          <DataList.Value>Sophie Durand</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>Email</DataList.Label>
          <DataList.Value>sophie@astralis.dev</DataList.Value>
        </DataList.Item>
      </>
    ),
  },
  "table-demo": {
    tag: "Table",
    component: asEntry(Table),
    rows: tableProps,
    fixture: (
      <>
        <Table.Header>
          <Table.Row>
            <Table.Head>Version</Table.Head>
            <Table.Head>Released</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>0.3.0</Table.Cell>
            <Table.Cell>Jun 28</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>0.2.1</Table.Cell>
            <Table.Cell>Jun 14</Table.Cell>
          </Table.Row>
        </Table.Body>
      </>
    ),
  },
  "timeline-demo": {
    tag: "Timeline",
    component: asEntry(Timeline),
    rows: timelineProps,
    fixture: (
      <>
        <Timeline.Item>
          <Timeline.Indicator />
          <Timeline.Content>
            <Timeline.Title>Order placed</Timeline.Title>
            <Timeline.Description>Confirmed at 2:30 PM</Timeline.Description>
          </Timeline.Content>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Indicator />
          <Timeline.Content>
            <Timeline.Title>In transit</Timeline.Title>
            <Timeline.Description>Left the depot</Timeline.Description>
          </Timeline.Content>
        </Timeline.Item>
      </>
    ),
  },
  "image-demo": {
    tag: "Image",
    component: asEntry(Image),
    rows: imageProps,
    baseProps: { src: "/placeholder.svg", alt: "A starfield gradient", width: 320 },
  },
  "marquee-demo": {
    tag: "Marquee",
    component: asEntry(Marquee),
    rows: marqueeProps,
    fixture: (
      <>
        <Marquee.Item>
          <Badge variant="surface" colorScheme="gray">React</Badge>
        </Marquee.Item>
        <Marquee.Item>
          <Badge variant="surface" colorScheme="gray">TypeScript</Badge>
        </Marquee.Item>
        <Marquee.Item>
          <Badge variant="surface" colorScheme="gray">Vitest</Badge>
        </Marquee.Item>
        <Marquee.Item>
          <Badge variant="surface" colorScheme="gray">Next.js</Badge>
        </Marquee.Item>
        <Marquee.Item>
          <Badge variant="surface" colorScheme="gray">pnpm</Badge>
        </Marquee.Item>
      </>
    ),
  },
  "qr-code-demo": {
    tag: "QrCode",
    component: asEntry(QrCode),
    rows: qrCodeProps,
    baseProps: { value: "https://astralis-ui.com" },
  },
  "stat-demo": {
    tag: "Stat",
    component: asEntry(Stat),
    rows: statProps,
    fixture: (
      <>
        <Stat.Label>Total users</Stat.Label>
        <Stat.Value>24,521</Stat.Value>
        <Stat.HelpText>
          <Stat.Indicator type="increase">12.4%</Stat.Indicator> from last month
        </Stat.HelpText>
      </>
    ),
  },
});
