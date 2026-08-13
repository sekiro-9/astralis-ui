import type { Meta, StoryObj } from "@storybook/react-vite";
import { VStack } from "../../layout/stack";
import { Text } from "../../typography/text";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "./index";

/**
 * Breadcrumb shows where a page sits in the hierarchy above it. It's a compound
 * component: the root draws the trail and interleaves separators, `Breadcrumb.Item`
 * is one crumb, and `Breadcrumb.Link` is the crumb's label — either navigable or,
 * with `isCurrent`, the page you're already on.
 */
const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "A hierarchical trail of links to ancestor pages." } },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#">Components</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Link isCurrent>Breadcrumb</Breadcrumb.Link>
      </Breadcrumb.Item>
    </Breadcrumb>
  ),
};

/** The last crumb takes `isCurrent`: a `span` with `aria-current="page"`, not a link. */
export const CurrentPage: Story = {
  render: () => (
    <VStack gap="4" alignItems="start">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Docs</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link isCurrent>Installation</Breadcrumb.Link>
        </Breadcrumb.Item>
      </Breadcrumb>
      <Text size="sm" color="muted">
        The current crumb is not clickable — it points at the page you are on.
      </Text>
    </VStack>
  ),
};

/** Any node works as the separator; it is rendered `aria-hidden` between crumbs. */
export const CustomSeparator: Story = {
  render: () => (
    <VStack gap="4" alignItems="start">
      <Breadcrumb separator="/">
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Settings</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link isCurrent>Billing</Breadcrumb.Link>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Breadcrumb separator="›">
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Workspace</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link isCurrent>Dashboard</Breadcrumb.Link>
        </Breadcrumb.Item>
      </Breadcrumb>
    </VStack>
  ),
};

/** A long trail wraps rather than overflowing its container. */
export const Wrapping: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Workspace</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Projects</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Design system</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link isCurrent>Tokens</Breadcrumb.Link>
        </Breadcrumb.Item>
      </Breadcrumb>
    </div>
  ),
};

/**
 * The flat exports render identically. Server Components need this spelling —
 * a client-reference stub carries no static properties, so dotted access there
 * resolves to undefined.
 */
export const FlatExports: Story = {
  render: () => (
    // The compound root IS the flat root (Object.assign) — index.ts exports no
    // separate BreadcrumbRoot, and importing one breaks the production build.
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink href="#">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink isCurrent>Current</BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};
