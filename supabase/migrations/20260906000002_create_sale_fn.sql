-- Creates a full sale (header + line items + stock update + invoice number)
-- in a single transaction, so a bill is never left half-written.
--
-- p_items shape: [{ "product_id": uuid|null, "sku_code": text, "name": text,
--                    "unit": text, "qty": numeric, "unit_price": numeric,
--                    "gst_rate": numeric }, ...]
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
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'A sale needs at least one item';
  end if;

  v_series := case p_bill_type when 'gst' then 'GST' else 'NONGST' end;
  v_invoice_number := next_invoice_number(v_series, p_financial_year);

  -- totals
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

    if nullif(v_item->>'product_id', '') is not null then
      update products
      set current_stock = current_stock - (v_item->>'qty')::numeric,
          updated_at = now()
      where id = (v_item->>'product_id')::uuid;
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
