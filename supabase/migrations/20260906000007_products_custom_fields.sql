-- Safety valve for future SKU details we haven't thought of yet. Every
-- migration in this project already follows the safe pattern (new columns
-- are nullable or defaulted, so adding one never breaks existing rows or
-- code that doesn't know about it yet — a plain `select *` just carries the
-- new field along). This column additionally lets ad-hoc attributes be
-- attached to a product without a migration at all, e.g. {"weight_grams": 450}.
alter table products add column custom_fields jsonb not null default '{}'::jsonb;
