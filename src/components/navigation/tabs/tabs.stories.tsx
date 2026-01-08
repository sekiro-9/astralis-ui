import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Tabs } from "./index";

const meta: Meta<typeof Tabs> = {
  title: "Components/Navigation/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <div className="astralis-w-[400px]">
      <Tabs defaultValue="account">
        <Tabs.List>
          <Tabs.Trigger value="account">Account</Tabs.Trigger>
          <Tabs.Trigger value="password">Password</Tabs.Trigger>
          <Tabs.Trigger value="billing">Billing</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="account">
          Account settings content
        </Tabs.Content>

        <Tabs.Content value="password">
          Password settings content
        </Tabs.Content>

        <Tabs.Content value="billing">
          Billing settings content
        </Tabs.Content>
      </Tabs>
    </div>
  ),
};


export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("one");

    return (
      <div className="astralis-w-[400px]">
        <Tabs value={value} onChange={setValue}>
          <Tabs.List>
            <Tabs.Trigger value="one">One</Tabs.Trigger>
            <Tabs.Trigger value="two">Two</Tabs.Trigger>
            <Tabs.Trigger value="three">Three</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="one">Tab one content</Tabs.Content>
          <Tabs.Content value="two">Tab two content</Tabs.Content>
          <Tabs.Content value="three">Tab three content</Tabs.Content>
        </Tabs>
      </div>
    );
  },
};


export const Sizes: Story = {
  render: () => (
    <div className="astralis-flex astralis-flex-col astralis-gap-6">
      {(["sm", "md", "lg"] as const).map(size => (
        <Tabs key={size} defaultValue="a" size={size}>
          <Tabs.List>
            <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
            <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="a">
            Size: {size}
          </Tabs.Content>

          <Tabs.Content value="b">
            Size: {size}
          </Tabs.Content>
        </Tabs>
      ))}
    </div>
  ),
};


export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="profile" orientation="vertical">
      <div className="astralis-flex astralis-gap-6">
        <Tabs.List>
          <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
          <Tabs.Trigger value="security">Security</Tabs.Trigger>
          <Tabs.Trigger value="team">Team</Tabs.Trigger>
        </Tabs.List>

        <div>
          <Tabs.Content value="profile">
            Profile content
          </Tabs.Content>
          <Tabs.Content value="security">
            Security content
          </Tabs.Content>
          <Tabs.Content value="team">
            Team content
          </Tabs.Content>
        </div>
      </div>
    </Tabs>
  ),
};


export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="active">
      <Tabs.List>
        <Tabs.Trigger value="active">Active</Tabs.Trigger>
        <Tabs.Trigger value="disabled" disabled>
          Disabled
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="active">
        Active tab content
      </Tabs.Content>

      <Tabs.Content value="disabled">
        You should never see this
      </Tabs.Content>
    </Tabs>
  ),
};


