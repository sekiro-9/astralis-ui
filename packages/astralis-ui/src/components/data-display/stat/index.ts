import { StatRoot } from "./components/stat-root";
import { StatLabel } from "./components/stat-label";
import { StatValue } from "./components/stat-value";
import { StatHelpText } from "./components/stat-help-text";
import { StatIndicator } from "./components/stat-indicator";

/* 1️⃣ Compound API */
export const Stat = Object.assign(StatRoot, {
  Label: StatLabel,
  Value: StatValue,
  HelpText: StatHelpText,
  Indicator: StatIndicator,
});

/* 2️⃣ Flat exports */
/*
 * StatRoot included: every other part was flat-exported and it was not, so a
 * Server Component could import the pieces but had no way to import the root
 * that provides their context. Dotted access resolves to undefined across the
 * RSC boundary, which made Stat unusable in a block.
 */
export {
  StatRoot,
  StatLabel,
  StatValue,
  StatHelpText,
  StatIndicator,
};

/* 3️⃣ Types */
export type {
  StatProps,
  StatLabelProps,
  StatValueProps,
  StatHelpTextProps,
  StatIndicatorProps,
} from "./stat.types";
