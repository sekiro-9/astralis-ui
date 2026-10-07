const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "26 Sep 2026". In UTC, so the server and every reader agree on the day;
 * spelled out rather than through Intl, whose en-GB short month for
 * September is "Sept".
 */
export const formatDate = (value: Date | string): string => {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
};

export const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`;
