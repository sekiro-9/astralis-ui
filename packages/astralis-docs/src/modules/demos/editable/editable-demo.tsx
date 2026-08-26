import { Editable } from "astralis-ui";

export function EditableDemo() {
  return (
    <Editable defaultValue="Q3 launch plan" size="lg">
      <Editable.Preview />
      <Editable.Input aria-label="Document title" />
    </Editable>
  );
}
