"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

// Shared "edit a cell, it saves itself" logic behind both the desktop
// spreadsheet row and the mobile card layout.
export function useEditableProduct(product: Product, onSaved: (p: Product) => void) {
  const [values, setValues] = useState(product);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => setValues(product), [product]);

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save(field: keyof Product) {
    if (values[field] === product[field]) return;
    setStatus("saving");
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: values[field] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      setStatus("saved");
      onSaved(data.product as Product);
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1200);
    } catch {
      setStatus("error");
      setValues(product);
      setTimeout(() => setStatus((s) => (s === "error" ? "idle" : s)), 2000);
    }
  }

  async function remove() {
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: false }),
    });
    return res.ok;
  }

  return { values, set, save, status, remove };
}
