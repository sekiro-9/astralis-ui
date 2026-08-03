import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the calendar component's types in astralis-ui. */
export const calendarProps: PropRow[] = [
  {
    prop: "selectionMode",
    type: `"single" | "multiple" | "range"`,
    default: `"single"`,
    description: "What a click selects.",
  },
  {
    prop: "value / defaultValue / onValueChange",
    type: `Date | Date[] | { start, end } | null`,
    description: "Controlled / uncontrolled API, shaped by the mode.",
  },
  {
    prop: "defaultMonth",
    type: `Date`,
    default: `today`,
    description: "Initially visible month.",
  },
  {
    prop: "locale",
    type: `string`,
    default: `"en-US"`,
    description: "Intl locale for month/weekday names.",
  },
  {
    prop: "firstDayOfWeek",
    type: `0 – 6`,
    default: `0`,
    description: "0 = Sunday, 1 = Monday…",
  },
  {
    prop: "minDate / maxDate / isDateUnavailable",
    type: `Date / Date / (date) => boolean`,
    description: "Selection constraints.",
  },
  {
    prop: "showOutsideDays",
    type: `boolean`,
    default: `true`,
    description: "Render the adjacent months' spill-over days.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Cell size.",
  },
];
