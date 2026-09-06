-- Catalog v2: material type, company/brand, kg-vs-piece selling,
-- MRP-vs-rate pricing, and optional (nullable) stock tracking.
--
-- Stock rule: current_stock starts untracked (NULL) for every item. An
-- untracked item's stock is never checked or touched by a sale. The moment
-- someone types an actual number into stock for an item, it becomes
-- "tracked" and can never go below 0 again.

alter table products rename column category to material_type;
alter table products add column company text;
alter table products add column selling_unit text not null default 'qty' check (selling_unit in ('kg', 'qty'));
alter table products add column price_type text not null default 'mrp' check (price_type in ('mrp', 'rate_based'));

alter table products alter column current_stock drop default;
alter table products alter column current_stock drop not null;
update products set current_stock = null; -- nothing real in there yet (test data only)

alter table products add constraint current_stock_not_negative
  check (current_stock is null or current_stock >= 0);

-- Stock-aware version of create_sale: untracked (NULL) items are left alone;
-- tracked items are blocked from going below zero.
create or replace function create_sale(
  p_bill_type text,
  p_payment_method text,
  p_customer_name text,
  p_customer_phone text,
  p_financial_year text,
  p_items jsonb
)
returns jsonb
language plpgsql
as $$
declare
  v_series text;
  v_invoice_number text;
  v_sale_id uuid;
  v_subtotal numeric(12,2) := 0;
  v_gst_amount numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_line_total numeric(12,2);
  v_line_gst numeric(12,2);
  v_product_id uuid;
  v_current_stock numeric(12,2);
  v_qty numeric(12,2);
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'A sale needs at least one item';
  end if;

  v_series := case p_bill_type when 'gst' then 'GST' else 'NONGST' end;
  v_invoice_number := next_invoice_number(v_series, p_financial_year);

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_line_total := (v_item->>'qty')::numeric * (v_item->>'unit_price')::numeric;
    v_line_gst := case when p_bill_type = 'gst'
      then round(v_line_total * (v_item->>'gst_rate')::numeric / 100, 2)
      else 0
    end;
    v_subtotal := v_subtotal + v_line_total;
    v_gst_amount := v_gst_amount + v_line_gst;
  end loop;
  v_total := v_subtotal + v_gst_amount;

  insert into sales (invoice_number, series, financial_year, bill_type, payment_method,
                      customer_name, customer_phone, subtotal, gst_amount, total_amount)
  values (v_invoice_number, v_series, p_financial_year, p_bill_type, p_payment_method,
          nullif(p_customer_name, ''), nullif(p_customer_phone, ''), v_subtotal, v_gst_amount, v_total)
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_line_total := (v_item->>'qty')::numeric * (v_item->>'unit_price')::numeric;

    insert into sale_items (sale_id, product_id, sku_code, name, unit, qty, unit_price, gst_rate, line_total)
    values (
      v_sale_id,
      nullif(v_item->>'product_id', '')::uuid,
      v_item->>'sku_code',
      v_item->>'name',
      v_item->>'unit',
      (v_item->>'qty')::numeric,
      (v_item->>'unit_price')::numeric,
      case when p_bill_type = 'gst' then (v_item->>'gst_rate')::numeric else 0 end,
      v_line_total
    );

    v_product_id := nullif(v_item->>'product_id', '')::uuid;
    if v_product_id is not null then
      v_qty := (v_item->>'qty')::numeric;

      select current_stock into v_current_stock from products where id = v_product_id for update;

      if v_current_stock is not null then
        if v_current_stock - v_qty < 0 then
          raise exception 'Not enough stock for "%" — have %, tried to sell %',
            v_item->>'name', v_current_stock, v_qty;
        end if;
        update products set current_stock = current_stock - v_qty, updated_at = now()
        where id = v_product_id;
      end if;
      -- current_stock is null (untracked): leave it untouched, forever, until
      -- someone sets a real number on the item.
    end if;
  end loop;

  return jsonb_build_object(
    'id', v_sale_id,
    'invoice_number', v_invoice_number,
    'subtotal', v_subtotal,
    'gst_amount', v_gst_amount,
    'total_amount', v_total
  );
end;
$$;
