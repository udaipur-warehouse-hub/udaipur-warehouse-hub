import type { Product } from "./types";

// Display label derived from the product's kg-vs-quantity choice, rather
// than trusting a separately-editable free-text field that could drift out
// of sync with it.
export function sellingUnitLabel(su: Product["selling_unit"]): string {
  return su === "kg" ? "kg" : "pcs";
}
