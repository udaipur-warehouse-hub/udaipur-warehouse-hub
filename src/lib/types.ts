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

export type RetailVendor = {
  id: string;
  name: string;
  firm_name: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  balance: number;
  last_activity: string | null;
};

export type VendorLedgerEntry = {
  id: string;
  vendor_id: string;
  entry_type: "credit_sale" | "payment_received";
  amount: number;
  note: string | null;
  entry_date: string;
  created_at: string;
};

export type CreditVendor = {
  id: string;
  name: string;
  firm_name: string | null;
  phone: string | null;
  address: string | null;
  payment_frequency: "weekly" | "monthly";
  payment_amount: number | null;
  is_active: boolean;
  created_at: string;
  balance: number;
  last_activity: string | null;
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
