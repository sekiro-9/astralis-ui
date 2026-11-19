"use client";

import { useState } from "react";
import { DatePicker, Text, VStack, type DatePickerValue } from "astralis-ui";

export function DatePickerRange() {
  const [value, setValue] = useState<DatePickerValue>({ start: new Date(2026, 10, 16), end: new Date(2026, 10, 20) });
  const nights = value && !(value instanceof Date) && value.start && value.end
    ? Math.round((value.end.getTime() - value.start.getTime()) / 86_400_000)
    : null;

  return (
    <VStack gap="2" alignItems="stretch" w="full" maxW="72">
      <DatePicker selectionMode="range" value={value} onValueChange={setValue} aria-label="Stay" />
      <Text size="sm" color="muted">
        {nights === null ? "Pick a start and an end." : `${nights} nights`}
      </Text>
    </VStack>
  );
}
