import { FileUpload, Button, HStack } from "astralis-ui";
import { Paperclip } from "lucide-react";

export function FileUploadTrigger() {
  return (
    <FileUpload multiple>
      <HStack gap="3" alignItems="start">
        <FileUpload.Trigger>
          <Button variant="outline" colorScheme="gray" size="sm" leftIcon={<Paperclip size={14} />}>
            Attach files
          </Button>
        </FileUpload.Trigger>
      </HStack>
      <FileUpload.ItemGroup />
    </FileUpload>
  );
}
