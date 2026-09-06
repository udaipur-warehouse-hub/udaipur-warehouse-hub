export type Product = {
  id: string;
  sku_code: string;
  name: string;
  category: string | null;
  unit: string;
  hsn_code: string | null;
  gst_rate: number;
  cost_price: number | null;
  selling_price: number;
  current_stock: number;
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
