-- Phase 3: Credit Vendors — big regular buyers (hotels etc.) on a fixed
-- weekly/monthly payment plan, fully reconciled only every 6-8 months.
-- Same ledger shape as Retail Vendors, plus the agreed payment plan as
-- reference info.

create table credit_vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  payment_frequency text not null default 'monthly' check (payment_frequency in ('weekly', 'monthly')),
  payment_amount numeric(12,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table credit_vendor_ledger (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references credit_vendors(id) on delete cascade,
  entry_type text not null check (entry_type in ('credit_sale', 'payment_received')),
  amount numeric(12,2) not null check (amount > 0),
  note text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index credit_vendor_ledger_vendor_idx on credit_vendor_ledger (vendor_id, entry_date, created_at);

create view credit_vendor_balances as
select
  v.id,
  v.name,
  v.phone,
  v.address,
  v.payment_frequency,
  v.payment_amount,
  v.is_active,
  v.created_at,
  coalesce(sum(case when l.entry_type = 'credit_sale' then l.amount else 0 end), 0)
    - coalesce(sum(case when l.entry_type = 'payment_received' then l.amount else 0 end), 0) as balance,
  max(l.entry_date) as last_activity
from credit_vendors v
left join credit_vendor_ledger l on l.vendor_id = v.id
group by v.id;

alter table credit_vendors enable row level security;
alter table credit_vendor_ledger enable row level security;
