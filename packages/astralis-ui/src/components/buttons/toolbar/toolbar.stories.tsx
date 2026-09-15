import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { CopyButton } from "../copy-button";
import { Toolbar } from "./index";

/**
 * A `role="toolbar"` row of controls. Arrow keys move focus between them
 * (Home/End jump to the ends); `label` names the toolbar for assistive tech.
 */
const meta: Meta<typeof Toolbar> = {
  title: "Components/Buttons/Toolbar",
  component: Toolbar,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: { type: "inline-radio" }, options: ["horizontal", "vertical"] },
  },
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Usage: Story = {
  render: (args) => (
    <Toolbar {...args} label="Formatting">
      <Toolbar.Group>
        <Button size="sm" variant="text" colorScheme="gray">Bold</Button>
        <Button size="sm" variant="text" colorScheme="gray">Italic</Button>
        <Button size="sm" variant="text" colorScheme="gray">Underline</Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Button size="sm" variant="text" colorScheme="gray">Link</Button>
      <CopyButton size="sm" variant="text" colorScheme="gray" value="Formatted text" />
    </Toolbar>
  ),
};

/** Vertical toolbars move focus with the up and down arrows. */
export const Vertical: Story = {
  render: () => (
    <Toolbar label="Tools" orientation="vertical" alignSelf="start">
      <Button size="sm" variant="text" colorScheme="gray">Select</Button>
      <Button size="sm" variant="text" colorScheme="gray">Draw</Button>
      <Button size="sm" variant="text" colorScheme="gray">Erase</Button>
    </Toolbar>
  ),
};
