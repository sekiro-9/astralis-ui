"use client";

import { FileUpload, Box, Text } from "astralis-ui";
import { useState } from "react";

export function FileUploadDemo() {
  const [rejected, setRejected] = useState<string | null>(null);

  return (
    <Box w="full" maxW="md">
      <FileUpload
        multiple
        maxFiles={3}
        maxSize={5 * 1024 * 1024}
        onReject={(rejections) =>
          setRejected(rejections.map((r) => `${r.file.name} (${r.reason})`).join(", "))
        }
      >
        <FileUpload.Dropzone />
        <FileUpload.ItemGroup />
      </FileUpload>
      {rejected && (
        <Text size="xs" color="muted" mt="2">
          Rejected: {rejected} — max 3 files, 5 MB each.
        </Text>
      )}
    </Box>
  );
}
