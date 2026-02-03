import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover } from "./index";
import { useState } from "react";
import type { PopoverPlacement } from "./popover.types";

const meta: Meta<typeof Popover> = {
  title: "Components/Overlay/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Displays rich content in a portal, triggered by a button.",
      },
    },
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
    trigger: {
      control: "radio",
      options: ["click", "hover"],
      description: "Event that triggers the popover",
    },
    onOpenChange: {
      action: "openChange",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger>
        <button className="astralis-btn astralis-bg-surface-raised astralis-px-4 astralis-py-2 astralis-rounded astralis-border astralis-border-border-base hover:astralis-bg-surface-overlay">
          Open Popover
        </button>
      </Popover.Trigger>

      <Popover.Content className="astralis-w-80">
        <div className="astralis-grid astralis-gap-4">
          <div className="astralis-space-y-2">
            <h4 className="astralis-font-medium astralis-leading-none">
              Dimensions
            </h4>
            <p className="astralis-text-sm astralis-text-content-secondary">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="astralis-grid astralis-gap-2">
            <div className="astralis-grid astralis-grid-cols-3 astralis-items-center astralis-gap-4">
              <label htmlFor="width">Width</label>
              <input
                id="width"
                defaultValue="100%"
                className="astralis-col-span-2 astralis-h-8 astralis-border astralis-border-border-base astralis-px-2 astralis-rounded"
              />
            </div>
            <div className="astralis-grid astralis-grid-cols-3 astralis-items-center astralis-gap-4">
              <label htmlFor="maxWidth">Max. width</label>
              <input
                id="maxWidth"
                defaultValue="300px"
                className="astralis-col-span-2 astralis-h-8 astralis-border astralis-border-border-base astralis-px-2 astralis-rounded"
              />
            </div>
          </div>
        </div>
      </Popover.Content>
    </Popover>
  ),
};

export const TriggerTypes: Story = {
  render: () => {
    return (
      <div className="astralis-flex astralis-gap-10">
        <Popover trigger="click">
          <Popover.Trigger>
            <button className="astralis-btn astralis-bg-surface-raised astralis-px-4 astralis-py-2 astralis-rounded astralis-border astralis-border-border-base hover:astralis-bg-surface-overlay">
              Click Me
            </button>
          </Popover.Trigger>
          <Popover.Content>
            <div className="astralis-p-4 astralis-max-w-xs">
              <h4 className="astralis-font-semibold astralis-mb-2">
                Click Trigger
              </h4>
              <p className="astralis-text-sm astralis-text-content-secondary">
                This popover is triggered by clicking. Click again or outside to
                close.
              </p>
            </div>
          </Popover.Content>
        </Popover>

        <Popover trigger="hover">
          <Popover.Trigger>
            <button className="astralis-btn astralis-bg-surface-raised astralis-px-4 astralis-py-2 astralis-rounded astralis-border astralis-border-border-base hover:astralis-bg-surface-overlay">
              Hover Me
            </button>
          </Popover.Trigger>
          <Popover.Content>
            <div className="astralis-p-4 astralis-max-w-xs">
              <h4 className="astralis-font-semibold astralis-mb-2">
                Hover Trigger
              </h4>
              <p className="astralis-text-sm astralis-text-content-secondary">
                This popover opens on hover and closes when you leave the
                trigger or the content.
              </p>
            </div>
          </Popover.Content>
        </Popover>
      </div>
    );
  },
};

export const Placements: Story = {
  render: () => {
    const placements: PopoverPlacement[] = [
      "top",
      "topLeft",
      "topRight",
      "bottom",
      "bottomLeft",
      "bottomRight",
      "left",
      "leftTop",
      "leftBottom",
      "right",
      "rightTop",
      "rightBottom",
    ];

    const [currentPlacement, setCurrentPlacement] =
      useState<PopoverPlacement>("top");
    const [open, setOpen] = useState(false);

    return (
      <div className="astralis-flex astralis-flex-col astralis-items-center astralis-gap-8 astralis-p-10">
        <div className="astralis-flex astralis-flex-wrap astralis-justify-center astralis-gap-2 astralis-max-w-2xl">
          {placements.map((placement) => (
            <button
              key={placement}
              onClick={() => {
                setCurrentPlacement(placement);
                setOpen(true);
              }}
              className={`astralis-px-3 astralis-py-1 astralis-text-xs astralis-rounded astralis-border astralis-transition-colors ${
                currentPlacement === placement
                  ? "astralis-bg-primary-base astralis-text-white astralis-border-primary-base"
                  : "astralis-bg-white astralis-text-content-primary astralis-border-border-base hover:astralis-bg-surface-raised"
              }`}
            >
              {placement}
            </button>
          ))}
        </div>

        <div className="astralis-h-[200px] astralis-flex astralis-items-center astralis-justify-center">
          <Popover
            open={open}
            onOpenChange={setOpen}
            trigger="click" // Forcing click for this demo to make it easier to see placements
          >
            <Popover.Trigger>
              <button className="astralis-h-16 astralis-w-32 astralis-bg-surface-raised astralis-rounded astralis-border astralis-border-border-base astralis-font-medium hover:astralis-bg-surface-overlay">
                Target
              </button>
            </Popover.Trigger>
            <Popover.Content side={currentPlacement} className="astralis-w-48">
              <div className="astralis-text-sm astralis-text-center">
                <p>
                  extends from <strong>{currentPlacement}</strong>
                </p>
              </div>
            </Popover.Content>
          </Popover>
        </div>
      </div>
    );
  },
};
