export type Product = {
  id: string;
  sku_code: string;
  name: string;
  material_type: string | null;
  company: string | null;
  selling_unit: "kg" | "qty";
  unit: string;
  hsn_code: string | null;
  gst_rate: number;
  price_type: "mrp" | "rate_based";
  cost_price: number | null;
  selling_price: number;
  current_stock: number | null; // null = not tracked
  is_active: boolean;
};

export type CartLine = {
  product_id: string | null;
  sku_code: string;
  name: string;
  unit: string;
  qty: number;
  unit_price: number;
  gst_rate: number;
};
