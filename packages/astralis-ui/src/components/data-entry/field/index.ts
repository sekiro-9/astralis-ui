import { FieldRoot } from "./components/field-root";
import { FieldLabel } from "./components/field-label";
import { FieldHelpText } from "./components/field-help-text";
import { FieldErrorText } from "./components/field-error-text";

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  HelpText: FieldHelpText,
  ErrorText: FieldErrorText,
});

export { FieldLabel, FieldHelpText, FieldErrorText };

// Public on purpose: custom controls read Field state through it.
export { useFieldContext } from "./field.context";

export type {
  FieldRootProps,
  FieldLabelProps,
  FieldHelpTextProps,
  FieldErrorTextProps,
  FieldContextValue,
} from "./field.types";
