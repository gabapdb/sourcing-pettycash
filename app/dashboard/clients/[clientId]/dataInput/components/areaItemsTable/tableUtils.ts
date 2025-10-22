/**
 * 🔹 tableUtils.ts
 * Shared helpers for formatting, totals, and calculations.
 * Keeps all logic consistent across Sourcing, Petty Cash, and Liquidation tables.
 */

/** ✅ Format a number as a peso currency string (₱1,234.56) */
export function formatPeso(value: number | string | undefined): string {
  const num = Number(value) || 0;
  return `₱${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** ✅ Calculate total = quantity × price (safe against NaN) */
export function calcTotal(quantity: number, price: number): number {
  const q = isFinite(quantity) ? quantity : 0;
  const p = isFinite(price) ? price : 0;
  return q * p;
}

/** ✅ Calculate grand total for an array of items */
export function calcGrandTotal<T extends { total?: number }>(items: T[]): number {
  return items.reduce((sum, item) => sum + (item.total || 0), 0);
}

/** ✅ Format text safely (trim + fallback) */
export function safeText(value: unknown): string {
  return String(value ?? "").trim();
}
