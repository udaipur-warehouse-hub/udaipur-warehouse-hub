import type { Product } from "./types";

// Display label derived from the product's kg-vs-quantity choice, rather
// than trusting a separately-editable free-text field that could drift out
// of sync with it.
export function sellingUnitLabel(su: Product["selling_unit"]): string {
  return su === "kg" ? "kg" : "pcs";
}

// Pieces can't be fractional (no such thing as 1.001 pieces); kg items are
// sold in practical 50-gram steps, not arbitrary decimals like 1.001 kg.
export function roundQtyForUnit(qty: number, unitLabel: string): number {
  if (unitLabel === "kg") {
    const steps = Math.round(qty / 0.05);
    const rounded = Math.round(steps * 0.05 * 100) / 100; // avoid float noise like 0.15000000000000002
    return Math.max(0.05, rounded);
  }
  return Math.max(1, Math.round(qty));
}

