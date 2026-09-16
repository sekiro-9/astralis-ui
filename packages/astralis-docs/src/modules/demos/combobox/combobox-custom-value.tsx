import { Combobox } from "astralis-ui";

const LABELS = [
  { label: "bug", value: "bug" },
  { label: "design", value: "design" },
  { label: "docs", value: "docs" },
  { label: "performance", value: "performance" },
];

export function ComboboxCustomValue() {
  return (
    <Combobox
      options={LABELS}
      allowCustomValue
      placeholder="Pick a label or type a new one…"
      clearable
      w="full"
      maxW="sm"
    />
  );
}
