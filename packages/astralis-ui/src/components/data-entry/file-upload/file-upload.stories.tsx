import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FileUpload } from "./index";
import type { FileUploadRejection } from "./index";
import { Field } from "../field";
import { Button } from "../../buttons/button";
import { VStack } from "../../layout/stack";
import { Text } from "../../typography/text";

const meta: Meta<typeof FileUpload> = {
  title: "Components/Data Entry/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "File picking and drag-and-drop over a hidden native `<input type=\"file\">`, so the picker, `accept` filtering and mobile integrations stay the platform's. Oversized or surplus picks are rejected through `onReject`, never silently dropped.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Dropzone: Story = {
  render: () => (
    <FileUpload multiple maxW="md">
      <FileUpload.Dropzone />
      <FileUpload.ItemGroup />
    </FileUpload>
  ),
};

/** Any single element can open the picker. */
export const ButtonTrigger: Story = {
  render: () => (
    <FileUpload accept="image/*">
      <FileUpload.Trigger>
        <Button variant="outline">Choose an image</Button>
      </FileUpload.Trigger>
      <FileUpload.ItemGroup />
    </FileUpload>
  ),
};

export const Limits: Story = {
  render: () => {
    const [rejected, setRejected] = useState<FileUploadRejection[]>([]);
    return (
      <VStack gap="2" alignItems="stretch" maxW="md">
        <FileUpload multiple maxFiles={2} maxSize={1024 * 1024} onReject={setRejected}>
          <FileUpload.Dropzone />
          <FileUpload.ItemGroup />
        </FileUpload>
        {rejected.length > 0 && (
          <Text size="sm" color="error">
            Refused: {rejected.map((r) => `${r.file.name} (${r.reason === "size" ? "over 1 MB" : "limit of 2"})`).join(", ")}
          </Text>
        )}
      </VStack>
    );
  },
};

/** Disabled and invalid come from the surrounding Field. */
export const InField: Story = {
  render: () => (
    <Field invalid maxW="md">
      <Field.Label>Attachments</Field.Label>
      <FileUpload multiple>
        <FileUpload.Dropzone />
        <FileUpload.ItemGroup />
      </FileUpload>
      <Field.ErrorText>Attach at least one file.</Field.ErrorText>
    </Field>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FileUpload disabled maxW="md">
      <FileUpload.Dropzone />
    </FileUpload>
  ),
};
