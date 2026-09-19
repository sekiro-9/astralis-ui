export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

/** Same day in an adjacent month, clamped to that month's length (Jan 31 → Feb 28). */
export function addMonthsClamped(date: Date, delta: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth() + delta, 1);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(date.getDate(), lastDay));
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/** Timezone-safe local key used to find a cell's button after re-render. */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** The first enabled day walking from `from` in `step`-day strides, or null
 *  within a year's search. */
export function nearestEnabled(from: Date, step: number, isDisabled: (date: Date) => boolean): Date | null {
  let date = from;
  for (let i = 0; i < 366; i++) {
    if (!isDisabled(date)) return date;
    date = addDays(date, step);
  }
  return null;
}
