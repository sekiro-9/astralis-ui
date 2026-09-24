/**
 * The sender's address as the host reports it. Vercel sets x-forwarded-for
 * itself, overwriting anything the client sent, so its first hop is the
 * client. Without either header every sender shares one bucket, which errs
 * on the side of limiting.
 */
export function clientAddress(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
