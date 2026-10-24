/**
 * Format an ISO timestamp string into a human-readable UTC date-time string.
 * e.g., "2026-01-01T00:00:00+00:00" -> "01 Jan 2026, 00:00 UTC"
 */
export function formatUtcDateTime(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;

    const day = String(d.getUTCDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const mins = String(d.getUTCMinutes()).padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${mins} UTC`;
  } catch {
    return isoStr;
  }
}

/**
 * Format an ISO timestamp string into a compact UTC string for charts/tables.
 * e.g., "01 Jan 00:00"
 */
export function formatUtcShort(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;

    const day = String(d.getUTCDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getUTCMonth()];
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const mins = String(d.getUTCMinutes()).padStart(2, '0');

    return `${day} ${month} ${hours}:${mins}`;
  } catch {
    return isoStr;
  }
}

/**
 * Format an ISO timestamp string for chart X-axis ticks.
 * Shows date and optional hour.
 */
export function formatChartAxisTick(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getUTCDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getUTCMonth()];
    const hours = String(d.getUTCHours()).padStart(2, '0');

    if (hours === '00') {
      return `${day} ${month}`;
    }
    return `${day} ${month} ${hours}:00`;
  } catch {
    return '';
  }
}

/**
 * Format a numeric megawatt value with thousands separators.
 * e.g., 15420.5 -> "15,420.5 MW"
 */
export function formatMw(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const num = Number(value);
  return `${num.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} MW`;
}

/**
 * Format a general metric number.
 * e.g., 2017.92 -> "2,017.92"
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const num = Number(value);
  return num.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a signed forecast error.
 * e.g., 345.2 -> "+345.2 MW", -120.0 -> "-120.0 MW"
 */
export function formatSignedError(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const num = Number(value);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} MW`;
}

/**
 * Calculate expected hourly periods between date_from and date_to (inclusive).
 * Each full day contains 24 hourly delivery periods.
 */
export function calculateExpectedPeriods(dateFromStr, dateToStr) {
  if (!dateFromStr || !dateToStr) return null;
  try {
    const from = new Date(dateFromStr + 'T00:00:00Z');
    const to = new Date(dateToStr + 'T00:00:00Z');
    const diffDays = Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays <= 0) return null;
    return diffDays * 24;
  } catch {
    return null;
  }
}
