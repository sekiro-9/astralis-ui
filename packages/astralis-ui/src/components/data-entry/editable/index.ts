import { EditableRoot } from "./components/editable-root";
import { EditablePreview, EditableInput } from "./components/editable-parts";

// 1️⃣ Compound API
export const Editable = Object.assign(EditableRoot, {
  Preview: EditablePreview,
  Input: EditableInput,
});

// 2️⃣ Flat exports
export { EditablePreview, EditableInput };

// 3️⃣ Type exports
export type {
  EditableProps,
  EditablePreviewProps,
  EditableInputProps,
  EditableSize,
  EditableContextValue,
} from "./editable.types";
