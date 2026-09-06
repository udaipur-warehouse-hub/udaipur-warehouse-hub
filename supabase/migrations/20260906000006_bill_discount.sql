-- Discount on a bill — either a flat percentage or a flat rupee amount off
-- the subtotal. Applied proportionally across line items so GST (which can
-- differ per item) is still calculated correctly on the discounted value.

alter table sales add column discount_type text check (discount_type in ('percent', 'amount'));
alter table sales add column discount_value numeric(12,2);
alter table sales add column discount_amount numeric(12,2) not null default 0;

create or replace function create_sale(
  p_bill_type text,
  p_payment_method text,
  p_customer_name text,
  p_customer_phone text,
  p_financial_year text,
  p_items jsonb,
  p_discount_type text default null,
  p_discount_value numeric default 0
)
returns jsonb
language plpgsql
as $$
declare
  v_series text;
  v_invoice_number text;
  v_sale_id uuid;
  v_subtotal numeric(12,2) := 0;
  v_discount_amount numeric(12,2) := 0;
  v_discount_ratio numeric := 0;
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

  -- Pass 1: raw subtotal, before any discount
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_subtotal := v_subtotal + (v_item->>'qty')::numeric * (v_item->>'unit_price')::numeric;
  end loop;

  if p_discount_type = 'percent' then
    v_discount_amount := round(v_subtotal * coalesce(p_discount_value, 0) / 100, 2);
  elsif p_discount_type = 'amount' then
    v_discount_amount := coalesce(p_discount_value, 0);
  end if;
  v_discount_amount := greatest(0, least(v_discount_amount, v_subtotal)); -- never negative, never more than the bill
  v_discount_ratio := case when v_subtotal > 0 then v_discount_amount / v_subtotal else 0 end;

  -- Pass 2: GST computed on the discounted value of each line
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_line_total := (v_item->>'qty')::numeric * (v_item->>'unit_price')::numeric;
    v_line_gst := case when p_bill_type = 'gst'
      then round(v_line_total * (1 - v_discount_ratio) * (v_item->>'gst_rate')::numeric / 100, 2)
      else 0
    end;
    v_gst_amount := v_gst_amount + v_line_gst;
  end loop;
  v_total := (v_subtotal - v_discount_amount) + v_gst_amount;

  insert into sales (invoice_number, series, financial_year, bill_type, payment_method,
                      customer_name, customer_phone, subtotal, gst_amount, total_amount,
                      discount_type, discount_value, discount_amount)
  values (v_invoice_number, v_series, p_financial_year, p_bill_type, p_payment_method,
          nullif(p_customer_name, ''), nullif(p_customer_phone, ''), v_subtotal, v_gst_amount, v_total,
          p_discount_type, nullif(p_discount_value, 0), v_discount_amount)
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
    end if;
  end loop;

  return jsonb_build_object(
    'id', v_sale_id,
    'invoice_number', v_invoice_number,
    'subtotal', v_subtotal,
    'discount_amount', v_discount_amount,
    'gst_amount', v_gst_amount,
    'total_amount', v_total
  );
end;
$$;
