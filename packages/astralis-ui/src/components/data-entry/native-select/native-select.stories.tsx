import type { Meta, StoryObj } from "@storybook/react-vite";
import { NativeSelect } from "./index";
import { Field } from "../field";
import { VStack } from "../../layout/stack";

const meta: Meta<typeof NativeSelect> = {
  title: "Components/Data Entry/NativeSelect",
  component: NativeSelect,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A styled native `<select>`: the platform's own dropdown, keyboard handling and mobile pickers, wearing Input's chrome. Reach for `Select` when options need custom rendering.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NativeSelect>;

const fruit = (
  <>
    <option value="apple">Apple</option>
    <option value="pear">Pear</option>
    <option value="plum">Plum</option>
  </>
);

export const Basic: Story = {
  render: () => (
    <NativeSelect aria-label="Fruit" placeholder="Pick a fruit" maxW="xs">
      {fruit}
    </NativeSelect>
  ),
};

/** The same four variants as Input. */
export const Variants: Story = {
  render: () => (
    <VStack gap="3" alignItems="stretch" maxW="xs">
      {(["outline", "filled", "underline", "unstyled"] as const).map((variant) => (
        <NativeSelect key={variant} aria-label={variant} variant={variant} defaultValue="pear">
          {fruit}
        </NativeSelect>
      ))}
    </VStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="3" alignItems="stretch" maxW="xs">
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeSelect key={size} aria-label={size} size={size} defaultValue="plum">
          {fruit}
        </NativeSelect>
      ))}
    </VStack>
  ),
};

export const InField: Story = {
  render: () => (
    <Field required invalid maxW="xs">
      <Field.Label>Favourite fruit</Field.Label>
      <NativeSelect placeholder="Pick one" colorScheme="purple">
        {fruit}
      </NativeSelect>
      <Field.ErrorText>Choose a fruit to continue.</Field.ErrorText>
    </Field>
  ),
};
