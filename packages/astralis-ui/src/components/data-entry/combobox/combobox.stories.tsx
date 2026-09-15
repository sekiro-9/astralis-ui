import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Combobox } from "./index";
import { Field } from "../field";
import { VStack } from "../../layout/stack";
import { Text } from "../../typography/text";

/**
 * Combobox is a filterable single-value picker on the ARIA combobox pattern:
 * type to filter, arrows to move, Enter to commit, Escape to revert.
 */
const meta: Meta<typeof Combobox> = {
  title: "Components/Data Entry/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Combobox>;

const frameworks = [
  { label: "Next.js", value: "next" },
  { label: "Remix", value: "remix" },
  { label: "Astro", value: "astro" },
  { label: "Vite", value: "vite" },
  { label: "Gatsby", value: "gatsby", disabled: true },
];

export const Basic: Story = {
  render: () => (
    <Field>
      <Field.Label>Framework</Field.Label>
      <Combobox options={frameworks} placeholder="Search frameworks…" clearable />
    </Field>
  ),
};

/** Controlled through `value` and `onValueChange`. */
export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = useState<string | number | null>("astro");
    return (
      <VStack gap="2" alignItems="stretch">
        <Combobox aria-label="Framework" options={frameworks} value={value} onValueChange={setValue} clearable />
        <Text size="sm">Value: {String(value)}</Text>
      </VStack>
    );
  },
};

/** Groups, and `searchLabel` to match on words the label does not show. */
export const GroupsAndSearchLabel: Story = {
  render: () => (
    <Combobox
      aria-label="Country"
      placeholder="Try “britain”"
      options={[
        {
          group: "Europe",
          options: [
            { label: "United Kingdom", value: "uk", searchLabel: "united kingdom britain gb" },
            { label: "Germany", value: "de", searchLabel: "germany deutschland" },
          ],
        },
        { group: "Asia", options: [{ label: "Japan", value: "jp", searchLabel: "japan nippon" }] },
      ]}
    />
  ),
};

/** `allowCustomValue` turns the options into suggestions. */
export const CustomValue: Story = {
  render: () => (
    <Combobox
      aria-label="Spacing"
      allowCustomValue
      placeholder="Pick or type a size"
      options={[
        { label: "0.5rem", value: "0.5rem" },
        { label: "1rem", value: "1rem" },
        { label: "2rem", value: "2rem" },
      ]}
    />
  ),
};
