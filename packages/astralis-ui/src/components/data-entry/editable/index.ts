import { EditableRoot } from "./components/editable-root";
import { EditablePreview, EditableInput } from "./components/editable-parts";

export const Editable = Object.assign(EditableRoot, {
  Preview: EditablePreview,
  Input: EditableInput,
});

export { EditablePreview, EditableInput };

export type {
  EditableProps,
  EditablePreviewProps,
  EditableInputProps,
  EditableSize,
  EditableContextValue,
} from "./editable.types";
