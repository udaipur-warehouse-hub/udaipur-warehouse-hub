"use client";

import { useEffect, useState } from "react";
import type { Expense, ExpenseCategory, Employee } from "@/lib/types";
import { Panel } from "@/components/panel";
import { NumberField } from "@/components/number-field";

type Summary = {
  month: string;
  inflow: { salesRevenue: number; vendorPaymentsIn: number; total: number };
  outflow: { total: number; byCategory: Record<string, number> };
  net: number;
  outstandingReceivable: number;
};

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  purchase_gst: "Purchase (with GST bill)",
  purchase_no_bill: "Purchase (without bill)",
  salary: "Salary",
  rent: "Rent",
  other: "Other",
};

export function FinanceClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const [sRes, eRes, empRes] = await Promise.all([
      fetch("/api/finance/summary"),
      fetch("/api/expenses?limit=30"),
      fetch("/api/employees"),
    ]);
    setSummary(await sRes.json());
    setExpenses((await eRes.json()).expenses ?? []);
    setEmployees((await empRes.json()).employees ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="space-y-5">
      <Panel title="Cashflow" subtitle={summary ? `This month (${summary.month})` : undefined}>
        {loading || !summary ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Money in" value={summary.inflow.total} tone="success" />
              <Stat label="Money out" value={summary.outflow.total} tone="danger" />
              <Stat label="Net" value={summary.net} tone={summary.net >= 0 ? "success" : "danger"} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm border-t border-border pt-4">
              <div>
                <div className="text-xs font-medium text-muted mb-1.5">Money in, by source</div>
                <Row label="Sales revenue" value={summary.inflow.salesRevenue} />
                <Row label="Vendor payments received" value={summary.inflow.vendorPaymentsIn} />
              </div>
              <div>
                <div className="text-xs font-medium text-muted mb-1.5">Money out, by category</div>
                {Object.keys(summary.outflow.byCategory).length === 0 ? (
                  <p className="text-muted text-xs">No expenses recorded this month.</p>
                ) : (
                  Object.entries(summary.outflow.byCategory).map(([cat, amt]) => (
                    <Row key={cat} label={CATEGORY_LABELS[cat as ExpenseCategory] ?? cat} value={amt} />
                  ))
                )}
              </div>
            </div>
            <div className="border-t border-border pt-3 text-sm flex justify-between">
              <span className="text-muted">Outstanding from vendors (not counted above — not collected yet)</span>
              <span className="font-medium">₹{summary.outstandingReceivable.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Panel>

      <RecordExpensePanel
        employees={employees}
        onRecorded={(e) => {
          setExpenses((list) => [e, ...list]);
          loadAll(); // refresh the summary too
        }}
      />

      <Panel title="Recent Expenses" subtitle={`${expenses.length} shown`} bodyClassName="p-0">
        {expenses.length === 0 ? (
          <p className="text-center text-muted py-10">No expenses recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background text-muted text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Note</th>
                  <th className="px-4 py-2 font-medium text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-4 py-2 text-muted">{e.expense_date}</td>
                    <td className="px-4 py-2">{CATEGORY_LABELS[e.category]}</td>
                    <td className="px-4 py-2 text-muted">{e.note || "—"}</td>
                    <td className="px-4 py-2 text-right">{e.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "success" | "danger" }) {
  return (
    <div className="rounded-xl bg-background p-3">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className={`text-xl font-bold ${tone === "success" ? "text-success" : "text-danger"}`}>
        ₹{value.toFixed(0)}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-muted py-0.5">
      <span>{label}</span>
      <span className="text-foreground">₹{value.toFixed(2)}</span>
    </div>
  );
}

function RecordExpensePanel({
  employees,
  onRecorded,
}: {
  employees: Employee[];
  onRecorded: (e: Expense) => void;
}) {
  const [category, setCategory] = useState<ExpenseCategory>("purchase_gst");
  const [amount, setAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "online">("cash");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [employeeId, setEmployeeId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!amount || amount <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          amount,
          payment_method: paymentMethod,
          note,
          expense_date: date,
          employee_id: category === "salary" ? employeeId || null : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not record expense");
      onRecorded(data.expense);
      setAmount(null);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel title="Record an expense" subtitle="Purchases, salary, rent, or anything else money went out for">
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                category === key ? "bg-copper text-white border-copper" : "border-border hover:bg-background"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {category === "salary" && (
          <label className="block max-w-xs">
            <span className="block text-xs font-medium text-muted mb-1">Employee</span>
            <select className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">— select —</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="grid sm:grid-cols-4 gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Amount (₹) *</span>
            <NumberField value={amount} onChange={setAmount} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Paid via</span>
            <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Date</span>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Note (optional)</span>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
        </div>

        {error && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{error}</div>
        )}

        <button className="btn-primary" disabled={saving} onClick={submit}>
          {saving ? "Saving…" : "Add expense"}
        </button>
      </div>
    </Panel>
  );
}
