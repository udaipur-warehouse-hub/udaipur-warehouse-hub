-- Phase 2: Retail Vendors — buy on credit, settle up every week or two.
-- Replaces the paper bahi khata with a live running balance per vendor.

create table retail_vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- One row per khata entry: either the vendor took goods on credit (debit —
-- increases what they owe) or they paid something back (credit — reduces
-- it). Amount is always a positive number; entry_type says which way it goes.
create table retail_vendor_ledger (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references retail_vendors(id) on delete cascade,
  entry_type text not null check (entry_type in ('credit_sale', 'payment_received')),
  amount numeric(12,2) not null check (amount > 0),
  note text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index retail_vendor_ledger_vendor_idx on retail_vendor_ledger (vendor_id, entry_date, created_at);

-- Live balance per vendor: what they currently owe (bahi khata replacement).
create view retail_vendor_balances as
select
  v.id,
  v.name,
  v.phone,
  v.address,
  v.is_active,
  v.created_at,
  coalesce(sum(case when l.entry_type = 'credit_sale' then l.amount else 0 end), 0)
    - coalesce(sum(case when l.entry_type = 'payment_received' then l.amount else 0 end), 0) as balance,
  max(l.entry_date) as last_activity
from retail_vendors v
left join retail_vendor_ledger l on l.vendor_id = v.id
group by v.id;

alter table retail_vendors enable row level security;
alter table retail_vendor_ledger enable row level security;
