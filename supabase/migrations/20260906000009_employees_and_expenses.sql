-- Employees + a general expense ledger. The expense ledger is what makes a
-- real cashflow view possible — until now the app only recorded money
-- coming in (sales), never money going out (purchases, salaries, rent).
-- Salary payments are simply expenses with category='salary' and an
-- employee_id, so they show up in both the employee's history and the
-- overall cashflow without keeping two copies of the same data.

create table employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  phone text,
  monthly_salary numeric(12,2),
  joined_on date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('purchase_gst', 'purchase_no_bill', 'salary', 'rent', 'other')),
  amount numeric(12,2) not null check (amount > 0),
  payment_method text check (payment_method in ('cash', 'card', 'online')),
  note text,
  expense_date date not null default current_date,
  employee_id uuid references employees(id) on delete set null,
  created_at timestamptz not null default now()
);

create index expenses_date_idx on expenses (expense_date desc);
create index expenses_employee_idx on expenses (employee_id);

alter table employees enable row level security;
alter table expenses enable row level security;
