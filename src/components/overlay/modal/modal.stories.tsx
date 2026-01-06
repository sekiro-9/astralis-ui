import type { Meta, StoryObj } from "@storybook/react-vite";
import { Modal } from "./index";

const meta: Meta<typeof Modal> = {
  title: "Components/Overlay/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
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
        <div className="astralis-w-[420px] astralis-rounded-xl astralis-bg-white astralis-p-6">
          <Modal.Header>Default Modal</Modal.Header>

          <p className="astralis-text-sm astralis-text-gray-600">
            This modal manages its own open state.
          </p>

          <Modal.Footer>
            <button className="astralis-btn-secondary">Cancel</button>
            <button className="astralis-btn-primary">Confirm</button>
          </Modal.Footer>
        </div>
      </Modal.Content>
    </Modal>
  ),
};


export const Controlled: Story = {
  args: {
    open: true,
  },
  render: (args) => (
    <Modal {...args}>
      <Modal.Overlay />

      <Modal.Content>
        <div className="astralis-w-[420px] astralis-rounded-xl astralis-bg-white astralis-p-6">
          <Modal.Header>Controlled Modal</Modal.Header>

          <p className="astralis-text-sm astralis-text-gray-600">
            This modal is fully controlled from outside.
          </p>

          <Modal.Footer>
            <button className="astralis-btn-primary">Okay</button>
          </Modal.Footer>
        </div>
      </Modal.Content>
    </Modal>
  ),
};


export const NoOverlayClose: Story = {
  render: () => (
    <Modal defaultOpen>
      <Modal.Trigger>
        <button className="astralis-btn">Open</button>
      </Modal.Trigger>

      <Modal.Overlay closeOnClick={false} />

      <Modal.Content>
        <div className="astralis-w-[420px] astralis-rounded-xl astralis-bg-white astralis-p-6">
          <Modal.Header>Overlay Locked</Modal.Header>

          <p className="astralis-text-sm astralis-text-gray-600">
            Clicking the overlay will not close this modal.
          </p>

          <Modal.Footer>
            <button className="astralis-btn-primary">Got it</button>
          </Modal.Footer>
        </div>
      </Modal.Content>
    </Modal>
  ),
};


export const LongContent: Story = {
  render: () => (
    <Modal defaultOpen>
      <Modal.Overlay />

      <Modal.Content>
        <div className="astralis-max-h-[80vh] astralis-w-[480px] astralis-overflow-y-auto astralis-rounded-xl astralis-bg-white astralis-p-6">
          <Modal.Header>Scrollable Modal</Modal.Header>

          <div className="astralis-space-y-3 astralis-text-sm astralis-text-gray-600">
            {Array.from({ length: 20 }).map((_, i) => (
              <p key={i}>
                This is line {i + 1} of scrollable content inside the modal.
              </p>
            ))}
          </div>

          <Modal.Footer>
            <button className="astralis-btn-primary">Close</button>
          </Modal.Footer>
        </div>
      </Modal.Content>
    </Modal>
  ),
};


export const ConfirmDialog: Story = {
  render: () => (
    <Modal defaultOpen>
      <Modal.Overlay />

      <Modal.Content>
        <div className="astralis-w-[400px] astralis-rounded-xl astralis-bg-white astralis-p-6">
          <Modal.Header>Delete Item</Modal.Header>

          <p className="astralis-text-sm astralis-text-gray-600">
            This action cannot be undone. Are you sure?
          </p>

          <Modal.Footer>
            <button className="astralis-btn-secondary">Cancel</button>
            <button className="astralis-btn-danger">Delete</button>
          </Modal.Footer>
        </div>
      </Modal.Content>
    </Modal>
  ),
};


