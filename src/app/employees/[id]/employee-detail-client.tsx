"use client";

import { useEffect, useState } from "react";
import type { Employee, Expense } from "@/lib/types";
import { Panel } from "@/components/panel";
import { NumberField } from "@/components/number-field";

export function EmployeeDetailClient({ employeeId }: { employeeId: string }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payments, setPayments] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/employees/${employeeId}`);
    const data = await res.json();
    if (res.ok) {
      setEmployee(data.employee);
      setPayments(data.payments ?? []);
    } else {
      setError(data.error || "Could not load employee");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  if (loading) return <p className="text-muted py-10 text-center">Loading…</p>;
  if (error || !employee) return <p className="text-danger py-10 text-center">{error || "Employee not found"}</p>;

  const paidThisMonth = payments
    .filter((p) => p.expense_date.slice(0, 7) === new Date().toISOString().slice(0, 7))
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5">
      <Panel title={employee.name} subtitle={[employee.role, employee.phone].filter(Boolean).join(" · ") || undefined}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted">Monthly salary</div>
            <div className="font-semibold">{employee.monthly_salary ? `₹${employee.monthly_salary}` : "not set"}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Paid this month</div>
            <div className="font-semibold">₹{paidThisMonth.toFixed(2)}</div>
          </div>
        </div>
      </Panel>

      <PaySalaryPanel employeeId={employeeId} onPaid={(p) => setPayments((list) => [p, ...list])} />

      <Panel title="Payment history" subtitle={`${payments.length} payment${payments.length === 1 ? "" : "s"}`} bodyClassName="p-0">
        {payments.length === 0 ? (
          <p className="text-center text-muted py-10">No payments recorded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {payments.map((p) => (
              <div key={p.id} className="flex justify-between items-center px-4 sm:px-5 py-3 text-sm">
                <div>
                  <div>{p.expense_date}</div>
                  {p.note && <div className="text-xs text-muted">{p.note}</div>}
                </div>
                <div className="font-medium">₹{p.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function PaySalaryPanel({ employeeId, onPaid }: { employeeId: string; onPaid: (p: Expense) => void }) {
  const [amount, setAmount] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
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
          category: "salary",
          amount,
          payment_method: "cash",
          note,
          expense_date: date,
          employee_id: employeeId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not record payment");
      onPaid(data.expense);
      setAmount(null);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel title="Pay salary" subtitle="This also counts toward the overall Finance Overview">
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-muted mb-1">Amount (₹) *</span>
          <NumberField value={amount} onChange={setAmount} />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-muted mb-1">Date</span>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-muted mb-1">Note (optional)</span>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. September salary" />
        </label>
      </div>
      {error && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 mt-3">{error}</div>
      )}
      <button className="btn-primary mt-3" disabled={saving} onClick={submit}>
        {saving ? "Saving…" : "Record payment"}
      </button>
    </Panel>
  );
}
