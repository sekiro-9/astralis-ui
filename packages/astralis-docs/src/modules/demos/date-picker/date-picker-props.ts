import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the date-picker component's types in astralis-ui. */
export const datePickerProps: PropRow[] = [
  {
    prop: "selectionMode",
    type: `"single" | "range"`,
    default: `"single"`,
    description: "Pick one date, or a start and an end.",
  },
  {
    prop: "value / defaultValue",
    type: `Date | { start: Date | null; end: Date | null } | null`,
    description: "Controlled / uncontrolled value. A Date in single mode, a start and end pair in range mode.",
  },
  {
    prop: "onValueChange",
    type: `(value) => void`,
    description: "Fires on each pick, and with null when cleared.",
  },
  {
    prop: "placeholder",
    type: `string`,
    default: `"Pick a date"`,
    description: "Shown while nothing is picked.",
  },
  {
    prop: "locale",
    type: `string`,
    default: `"en-US"`,
    description: "Locale of the shown date and of the calendar.",
  },
  {
    prop: "formatOptions",
    type: `Intl.DateTimeFormatOptions`,
    default: `{ dateStyle: "medium" }`,
    description: "How the picked date is written in the field.",
  },
  {
    prop: "minDate / maxDate",
    type: `Date`,
    description: "The earliest and latest dates that can be picked.",
  },
  {
    prop: "isDateUnavailable",
    type: `(date: Date) => boolean`,
    description: "Return true for dates that cannot be picked, such as weekends.",
  },
  {
    prop: "firstDayOfWeek",
    type: `0 – 6`,
    description: "The day the calendar's week starts on; 0 is Sunday.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "The field's height, matching Input.",
  },
  {
    prop: "variant",
    type: `"outline" | "filled" | "underline" | "unstyled"`,
    default: `"outline"`,
    description: "The field's chrome, matching Input.",
  },
  {
    prop: "colorScheme",
    type: `ColorScheme`,
    description: "Hue of the focus ring and of the selected day.",
  },
  {
    prop: "invalid / disabled",
    type: `boolean`,
    description: "Also read from a surrounding Field.",
  },
  {
    prop: "clearable",
    type: `boolean`,
    default: `true`,
    description: "Offer a Clear button in the calendar once a date is picked.",
  },
  {
    prop: "name",
    type: `string`,
    description: "Submit the value with a form, as an ISO date (2026-11-19), or start/end for a range.",
  },
  {
    prop: "open / defaultOpen / onOpenChange",
    type: `boolean · boolean · (open: boolean) => void`,
    description: "Control whether the calendar is open.",
  },
  {
    prop: "side",
    type: `"top" | "right" | "bottom" | "left"`,
    default: `"bottom"`,
    description: "Side of the field the calendar opens on.",
  },
  {
    prop: "align",
    type: `"start" | "center" | "end"`,
    default: `"start"`,
    description: "How the calendar lines up with the field.",
  },
];
