import { Toolbar, Button } from "astralis-ui";
import { Bold, Italic, Underline, Link2, List, ListOrdered } from "lucide-react";

export function ToolbarDemo() {
  return (
    <Toolbar label="Text formatting">
      <Toolbar.Group aria-label="Style">
        <Button size="sm" variant="text" colorScheme="gray" aria-label="Bold">
          <Bold size={16} />
        </Button>
        <Button size="sm" variant="text" colorScheme="gray" aria-label="Italic">
          <Italic size={16} />
        </Button>
        <Button size="sm" variant="text" colorScheme="gray" aria-label="Underline">
          <Underline size={16} />
        </Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Group aria-label="Lists">
        <Button size="sm" variant="text" colorScheme="gray" aria-label="Bulleted list">
          <List size={16} />
        </Button>
        <Button size="sm" variant="text" colorScheme="gray" aria-label="Numbered list">
          <ListOrdered size={16} />
        </Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Button size="sm" variant="text" colorScheme="gray" aria-label="Insert link">
        <Link2 size={16} />
      </Button>
    </Toolbar>
  );
}
