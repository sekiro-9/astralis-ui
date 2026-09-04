import { CheckboxBase } from "./components/checkbox";
import { CheckboxGroup } from "./components/checkbox-group";

export const Checkbox = Object.assign(CheckboxBase, {
  Group: CheckboxGroup,
});

export { CheckboxBase, CheckboxGroup };

export type {
  CheckboxProps,
  CheckboxGroupProps,
  CheckboxSize,
  CheckboxGroupContextValue,
} from "./checkbox.types";
