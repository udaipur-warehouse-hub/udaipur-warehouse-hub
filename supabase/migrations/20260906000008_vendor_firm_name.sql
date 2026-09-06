-- A vendor's contact person and their firm/business name are often
-- different (e.g. contact "Ramesh" at firm "Taj Hotel Udaipur").
alter table retail_vendors add column firm_name text;
alter table credit_vendors add column firm_name text;

-- Balance views select every column, so recreate them to pick up firm_name.
drop view retail_vendor_balances;
create view retail_vendor_balances as
select
  v.id,
  v.name,
  v.firm_name,
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

drop view credit_vendor_balances;
create view credit_vendor_balances as
select
  v.id,
  v.name,
  v.firm_name,
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
