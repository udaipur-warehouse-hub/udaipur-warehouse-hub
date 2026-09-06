-- Atomically get the next invoice number for a series + financial year.
-- Format: GM/GST/2026-27/000123  or  GM/NB/2026-27/000045  (NB = "no bill")
create or replace function next_invoice_number(p_series text, p_financial_year text)
returns text
language plpgsql
as $$
declare
  v_next int;
  v_prefix text;
begin
  insert into invoice_counters (series, financial_year, last_number)
  values (p_series, p_financial_year, 1)
  on conflict (series, financial_year)
  do update set last_number = invoice_counters.last_number + 1
  returning last_number into v_next;

  v_prefix := case p_series
    when 'GST' then 'GM/GST/'
    else 'GM/NB/'
  end;

  return v_prefix || p_financial_year || '/' || lpad(v_next::text, 6, '0');
end;
$$;
