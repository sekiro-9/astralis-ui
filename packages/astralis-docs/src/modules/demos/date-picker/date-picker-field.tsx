"use client";

import { DatePicker, Field } from "astralis-ui";

// Bookable from tomorrow for 30 days, weekends excluded.
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const lastDay = new Date();
lastDay.setDate(lastDay.getDate() + 30);
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

export function DatePickerField() {
  return (
    <Field w="full" maxW="64">
      <Field.Label>Appointment</Field.Label>
      <DatePicker
        name="appointment"
        minDate={tomorrow}
        maxDate={lastDay}
        isDateUnavailable={isWeekend}
        locale="en-GB"
        formatOptions={{ dateStyle: "full" }}
      />
      <Field.HelpText>Weekdays in the next 30 days.</Field.HelpText>
    </Field>
  );
}
