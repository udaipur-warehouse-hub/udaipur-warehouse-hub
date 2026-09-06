// Vercel functions run in UTC, but the shop's "today" is India time.
// Returns the UTC instants that bound midnight-to-midnight IST for the
// given moment (defaults to now), for use in created_at >= start / < end queries.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function istDayRange(date = new Date()) {
  const istNow = new Date(date.getTime() + IST_OFFSET_MS);
  const istMidnightUtcStamp = Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate());
  const startUtc = new Date(istMidnightUtcStamp - IST_OFFSET_MS);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
  return { startUtc: startUtc.toISOString(), endUtc: endUtc.toISOString() };
}
