import type { Meta, StoryObj } from "@storybook/react-vite";
import { Drawer } from "./index";

const meta: Meta<typeof Drawer> = {
  title: "Components/Overlay/Drawer",
  component: Drawer,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Controlled open state",
    },
    defaultOpen: {
      control: "boolean",
      description: "Initial open state (uncontrolled)",
    },
    side: {
      control: "select",
      options: ["left", "right", "top", "bottom"],
      description: "Side from which the drawer appears",
    },
    onOpenChange: {
      action: "openChange",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;


export const Default: Story = {
  args: {
    defaultOpen: false,
    side: "right",
  },
  render: (args) => (
    <Drawer {...args}>
      <Drawer.Trigger>
        <button className="astralis-btn">Open Drawer</button>
      </Drawer.Trigger>

      <Drawer.Overlay />

      <Drawer.Content>
        <div className="astralis-h-full astralis-w-[360px] astralis-bg-white astralis-p-6">
          <Drawer.Header>Default Drawer</Drawer.Header>

          <p className="astralis-text-sm astralis-text-gray-600">
            This drawer manages its own open state.
          </p>

          <Drawer.Footer>
            <button className="astralis-btn-secondary">Cancel</button>
            <button className="astralis-btn-primary">Save</button>
          </Drawer.Footer>
        </div>
      </Drawer.Content>
    </Drawer>
  ),
};


export const Controlled: Story = {
  args: {
    open: true,
    side: "right",
  },
  render: (args) => (
    <Drawer {...args}>
      <Drawer.Overlay />

      <Drawer.Content>
        <div className="astralis-h-full astralis-w-[360px] astralis-bg-white astralis-p-6">
          <Drawer.Header>Controlled Drawer</Drawer.Header>

          <p className="astralis-text-sm astralis-text-gray-600">
            This drawer is fully controlled from outside.
          </p>

          <Drawer.Footer>
            <button className="astralis-btn-primary">Okay</button>
          </Drawer.Footer>
        </div>
      </Drawer.Content>
    </Drawer>
  ),
};

export const Left: Story = {
  args: {
    defaultOpen: false,
    side: "left",
  },
  render: (args) => (
    <Drawer {...args}>
      <Drawer.Trigger>
        <button className="astralis-btn">Open Left Drawer</button>
      </Drawer.Trigger>

      <Drawer.Overlay />

      <Drawer.Content>
        <div className="astralis-h-full astralis-w-[360px] astralis-bg-white astralis-p-6">
          <Drawer.Header>Left Drawer</Drawer.Header>

          <p className="astralis-text-sm astralis-text-gray-600">
            Drawer sliding in from the left.
          </p>
        </div>
      </Drawer.Content>
    </Drawer>
  ),
};

export const Bottom: Story = {
  args: {
    defaultOpen: false,
    side: "bottom",
  },
  render: (args) => (
    <Drawer {...args}>
      <Drawer.Trigger>
        <button className="astralis-btn">Open Bottom Drawer</button>
      </Drawer.Trigger>

      <Drawer.Overlay />

      <Drawer.Content>
        <div className="astralis-h-[280px] astralis-w-full astralis-bg-white astralis-p-6">
          <Drawer.Header>Bottom Drawer</Drawer.Header>

          <p className="astralis-text-sm astralis-text-gray-600">
            Useful for mobile actions and quick selections.
          </p>
        </div>
      </Drawer.Content>
    </Drawer>
  ),
};

export const NoOverlayClose: Story = {
  render: () => (
    <Drawer defaultOpen side="right">
      <Drawer.Trigger>
        <button className="astralis-btn">Open</button>
      </Drawer.Trigger>

      <Drawer.Overlay closeOnClick={false} />

      <Drawer.Content>
        <div className="astralis-h-full astralis-w-[360px] astralis-bg-white astralis-p-6">
          <Drawer.Header>Overlay Locked</Drawer.Header>

          <p className="astralis-text-sm astralis-text-gray-600">
            Clicking the overlay will not close this drawer.
          </p>

          <Drawer.Footer>
            <button className="astralis-btn-primary">Got it</button>
          </Drawer.Footer>
        </div>
      </Drawer.Content>
    </Drawer>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Drawer defaultOpen side="right">
      <Drawer.Overlay />

      <Drawer.Content>
        <div className="astralis-h-full astralis-w-[360px] astralis-overflow-y-auto astralis-bg-white astralis-p-6">
          <Drawer.Header>Scrollable Drawer</Drawer.Header>

          <div className="astralis-space-y-3 astralis-text-sm astralis-text-gray-600">
            {Array.from({ length: 20 }).map((_, i) => (
              <p key={i}>
                This is line {i + 1} of scrollable drawer content.
              </p>
            ))}
          </div>

          <Drawer.Footer>
            <button className="astralis-btn-primary">Close</button>
          </Drawer.Footer>
        </div>
      </Drawer.Content>
    </Drawer>
  ),
};
