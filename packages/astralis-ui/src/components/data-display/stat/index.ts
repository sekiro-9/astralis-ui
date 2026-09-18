import { StatRoot } from "./components/stat-root";
import { StatLabel } from "./components/stat-label";
import { StatValue } from "./components/stat-value";
import { StatHelpText } from "./components/stat-help-text";
import { StatIndicator } from "./components/stat-indicator";

export const Stat = Object.assign(StatRoot, {
  Label: StatLabel,
  Value: StatValue,
  HelpText: StatHelpText,
  Indicator: StatIndicator,
});

export {
  StatLabel,
  StatValue,
  StatHelpText,
  StatIndicator,
};

export type {
  StatProps,
  StatSize,
  StatAlign,
  StatLabelProps,
  StatValueProps,
  StatHelpTextProps,
  StatIndicatorProps,
} from "./stat.types";
