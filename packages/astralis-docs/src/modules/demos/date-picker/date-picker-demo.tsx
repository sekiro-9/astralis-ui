"use client";

import { DatePicker, VStack } from "astralis-ui";

export function DatePickerDemo() {
  return (
    <VStack gap="4" alignItems="stretch" w="full" maxW="64">
      <DatePicker aria-label="Due date" />
      <DatePicker defaultValue={new Date(2026, 10, 23)} aria-label="Defence date" />
      <DatePicker defaultValue={new Date(2026, 10, 23)} disabled aria-label="Disabled" />
    </VStack>
  );
}
