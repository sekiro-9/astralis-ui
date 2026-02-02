import type { Meta, StoryObj } from "@storybook/react-vite";
import { Modal } from "./index";
import { useState } from "react";

const meta: Meta<typeof Modal> = {
  title: "Components/Overlay/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Used to display a modal dialog box",
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
    onOpenChange: {
      action: "openChange",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    defaultOpen: false,
  },
  render: (args) => (
    <Modal {...args}>
      <Modal.Trigger>
        <button className="astralis-btn">Open Modal</button>
      </Modal.Trigger>

      <Modal.Overlay />

      <Modal.Content>
        <Modal.Header>Default Modal</Modal.Header>

        <div className="astralis-p-4 astralis-flex-1">
          <p className="astralis-text-sm astralis-text-content-secondary">
            This modal manages its own open state.
          </p>
        </div>

        <Modal.Footer>
          <button className="astralis-btn-secondary">Cancel</button>
          <button className="astralis-btn-primary">Confirm</button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  ),
};

export const Sizes: Story = {
  render: () => {
    const sizes = ["xs", "sm", "md", "lg", "xl", "full"] as const;
    const [currentSize, setCurrentSize] =
      useState<(typeof sizes)[number]>("md");
    const [open, setOpen] = useState(false);

    return (
      <div className="astralis-flex astralis-gap-4 astralis-flex-wrap astralis-justify-center astralis-p-10">
        {sizes.map((size) => (
          <button
            key={size}
            className="astralis-btn"
            onClick={() => {
              setCurrentSize(size);
              setOpen(true);
            }}
          >
            Open ({size})
          </button>
        ))}

        <Modal open={open} onOpenChange={setOpen} size={currentSize}>
          <Modal.Overlay />
          <Modal.Content>
            <Modal.Header>
              {currentSize === "full"
                ? "Full Screen"
                : `${currentSize.toUpperCase()} Size`}{" "}
              Modal
            </Modal.Header>
            <div className="astralis-p-4 astralis-flex-1">
              <p className="astralis-text-sm astralis-text-content-secondary">
                This modal is using the{" "}
                <code className="astralis-bg-surface-raised astralis-p-1 astralis-rounded">
                  {currentSize}
                </code>{" "}
                size.
              </p>
            </div>
            <Modal.Footer>
              <button
                className="astralis-btn-primary"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </div>
    );
  },
};

export const Placement: Story = {
  render: () => {
    const placements = ["top", "center", "bottom"] as const;
    const [currentPlacement, setCurrentPlacement] =
      useState<(typeof placements)[number]>("center");
    const [open, setOpen] = useState(false);

    return (
      <div className="astralis-flex astralis-gap-4 astralis-flex-wrap astralis-justify-center astralis-p-10">
        {placements.map((placement) => (
          <button
            key={placement}
            className="astralis-btn"
            onClick={() => {
              setCurrentPlacement(placement);
              setOpen(true);
            }}
          >
            Open ({placement})
          </button>
        ))}

        <Modal open={open} onOpenChange={setOpen} placement={currentPlacement}>
          <Modal.Overlay />
          <Modal.Content>
            <Modal.Header>
              {currentPlacement.charAt(0).toUpperCase() +
                currentPlacement.slice(1)}{" "}
              Modal
            </Modal.Header>
            <div className="astralis-p-4 astralis-flex-1">
              <p className="astralis-text-sm astralis-text-content-secondary">
                This modal is positioned at the {currentPlacement}.
              </p>
            </div>
            <Modal.Footer>
              <button
                className="astralis-btn-primary"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </div>
    );
  },
};
