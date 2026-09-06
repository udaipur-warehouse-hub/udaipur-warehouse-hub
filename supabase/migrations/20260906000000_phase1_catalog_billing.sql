-- Phase 1: Item catalog + Retail Counter billing
-- Ganpati Metals Solution

-- Shop settings (single row) — used on invoices
create table shop_settings (
  id boolean primary key default true,
  constraint single_row check (id = true),
  shop_name text not null default 'Ganpati Metals',
  gstin text,
  address text,
  phone text,
  updated_at timestamptz not null default now()
);

insert into shop_settings (id, shop_name) values (true, 'Ganpati Metals');

-- Item catalog
create table products (
  id uuid primary key default gen_random_uuid(),
  sku_code text not null unique,
  name text not null,
  category text,
  unit text not null default 'pcs',
  hsn_code text,
  gst_rate numeric(5,2) not null default 0, -- e.g. 18.00 for 18%
  cost_price numeric(12,2),
  selling_price numeric(12,2) not null default 0,
  current_stock numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_name_idx on products using gin (to_tsvector('simple', name));
create index products_sku_idx on products (sku_code);

-- Invoice numbering — separate sequential series per bill type, reset each financial year
-- financial_year is stored like '2026-27' (India: Apr–Mar)
create table invoice_counters (
  series text not null,               -- 'GST' or 'NONGST'
  financial_year text not null,
  last_number int not null default 0,
  primary key (series, financial_year)
);

-- Sales made at the retail counter
create table sales (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,   -- e.g. GM/GST/2026-27/000123
  series text not null check (series in ('GST', 'NONGST')),
  financial_year text not null,
  bill_type text not null check (bill_type in ('gst', 'non_gst')),
  payment_method text not null check (payment_method in ('cash', 'card', 'online')),
  customer_name text,
  customer_phone text,
  subtotal numeric(12,2) not null default 0,
  gst_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index sales_created_at_idx on sales (created_at desc);

-- Line items per sale
create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  sku_code text not null,     -- snapshot, survives product edits/deletion
  name text not null,         -- snapshot
  unit text not null,
  qty numeric(12,2) not null,
  unit_price numeric(12,2) not null,
  gst_rate numeric(5,2) not null default 0,
  line_total numeric(12,2) not null
);

create index sale_items_sale_id_idx on sale_items (sale_id);

-- Lock every table down by default. All access goes through server-side code
-- using the service role key — the browser never talks to Supabase directly.
alter table shop_settings enable row level security;
alter table products enable row level security;
alter table invoice_counters enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
