// Same idea as ist-day-range, but for the whole current calendar month in
// India time — used for the Finance Overview's "this month" cashflow.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function istMonthRange(date = new Date()) {
  const istNow = new Date(date.getTime() + IST_OFFSET_MS);
  const monthStartUtcStamp = Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), 1);
  const monthEndUtcStamp = Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth() + 1, 1);
  const startUtc = new Date(monthStartUtcStamp - IST_OFFSET_MS);
  const endUtc = new Date(monthEndUtcStamp - IST_OFFSET_MS);

  // Plain YYYY-MM-DD bounds, for comparing against `date` (not timestamptz)
  // columns like expense_date / entry_date without a timezone conversion.
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = istNow.getUTCFullYear();
  const m = istNow.getUTCMonth();
  const startDate = `${y}-${pad(m + 1)}-01`;
  const nextMonth = new Date(Date.UTC(y, m + 1, 1));
  const endDate = `${nextMonth.getUTCFullYear()}-${pad(nextMonth.getUTCMonth() + 1)}-01`;

  return { startUtc: startUtc.toISOString(), endUtc: endUtc.toISOString(), startDate, endDate };
}
