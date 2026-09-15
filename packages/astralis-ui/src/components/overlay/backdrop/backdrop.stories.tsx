import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Backdrop } from "./index";
import { Button } from "../../buttons/button";
import { Spinner } from "../../feedback/spinner";

/**
 * Backdrop is the scrim Modal and Drawer paint behind their panels, as a
 * standalone primitive. It is purely presentational: render it to show it;
 * mounting and dismissal belong to the caller.
 */
const meta: Meta<typeof Backdrop> = {
  title: "Components/Overlay/Backdrop",
  component: Backdrop,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Backdrop>;

/** A blocking loading state; click the scrim to dismiss it. */
export const Blocking: Story = {
  render: function Render() {
    const [shown, setShown] = useState(false);
    return (
      <>
        <Button onClick={() => setShown(true)}>Show backdrop</Button>
        {shown && (
          <Backdrop onClick={() => setShown(false)}>
            <Spinner size="lg" />
          </Backdrop>
        )}
      </>
    );
  },
};

/** `blur={false}` for a flat scrim. */
export const WithoutBlur: Story = {
  render: function Render() {
    const [shown, setShown] = useState(false);
    return (
      <>
        <Button variant="outline" colorScheme="gray" onClick={() => setShown(true)}>
          Show flat backdrop
        </Button>
        {shown && <Backdrop blur={false} onClick={() => setShown(false)} />}
      </>
    );
  },
};
