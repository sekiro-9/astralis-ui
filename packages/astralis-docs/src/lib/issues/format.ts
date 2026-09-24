const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "26 Sep 2026". In UTC, so the server and every reader agree on the day;
 * spelled out rather than through Intl, whose en-GB short month for
 * September is "Sept".
 */
export const formatDate = (date: Date): string =>
  `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

/**
 * Where a form may send someone back to: a path on this site's issue pages,
 * never another origin (`//evil.test` is protocol-relative), so a crafted
 * form cannot turn sign-in into an open redirect.
 */
export function safeReturnPath(value: string): string {
  if (!value.startsWith("/issues") || value.startsWith("//") || /[\\\s]/.test(value)) return "/issues";
  return value;
}

export const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`;
