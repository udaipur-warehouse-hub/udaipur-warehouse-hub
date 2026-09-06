// India's financial year runs April 1 – March 31.
// e.g. any date in Apr 2026 – Mar 2027 belongs to FY "2026-27".
export function currentFinancialYear(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan
  const startYear = month >= 3 ? year : year - 1; // April = index 3
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endYearShort}`;
}
