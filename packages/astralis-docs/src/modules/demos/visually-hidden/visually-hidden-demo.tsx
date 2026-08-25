import { Button, VisuallyHidden } from "astralis-ui";
import { Settings } from "lucide-react";

// The icon is decorative; the VisuallyHidden text is the button's real name —
// visible to screen readers, invisible on screen.
export function VisuallyHiddenDemo() {
  return (
    <Button variant="outline" colorScheme="gray">
      <Settings size={16} aria-hidden="true" />
      <VisuallyHidden>Open settings</VisuallyHidden>
    </Button>
  );
}
