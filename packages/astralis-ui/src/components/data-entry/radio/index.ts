import { RadioBase } from "./components/radio";
import { RadioGroup } from "./components/radio-group";

export const Radio = Object.assign(RadioBase, {
  Group: RadioGroup,
});

export { RadioBase, RadioGroup };

export type {
  RadioProps,
  RadioGroupProps,
  RadioSize,
  RadioGroupContextValue,
} from "./radio.types";
