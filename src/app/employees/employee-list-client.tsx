"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Employee } from "@/lib/types";
import { Panel } from "@/components/panel";

export function EmployeeListClient() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function load(query = "") {
    setLoading(true);
    const res = await fetch(`/api/employees?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setEmployees(data.employees ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="space-y-5">
      <Panel
        title="Employees"
        subtitle={`${employees.length} active`}
        actions={
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            + Add employee
          </button>
        }
        bodyClassName="p-0"
      >
        <div className="px-4 sm:px-5 py-3 border-b border-border">
          <input
            className="input max-w-xs"
            placeholder="Search by name, role or phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {!loading && employees.length === 0 && (
          <p className="text-center text-muted py-10">
            {q ? "No employees match that search." : "No employees yet — add your first one above."}
          </p>
        )}

        <div className="divide-y divide-border">
          {employees.map((emp) => (
            <Link
              key={emp.id}
              href={`/employees/${emp.id}`}
              className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-background transition-colors"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{emp.name}</div>
                <div className="text-xs text-muted">
                  {emp.role || "no role set"} {emp.phone && `· ${emp.phone}`}
                </div>
              </div>
              {emp.monthly_salary && (
                <div className="text-right shrink-0 text-sm text-muted">₹{emp.monthly_salary}/month</div>
              )}
            </Link>
          ))}
        </div>
      </Panel>

      {showAdd && (
        <AddEmployeeModal onClose={() => setShowAdd(false)} onAdded={(e) => setEmployees((list) => [e, ...list])} />
      )}
    </div>
  );
}

function AddEmployeeModal({ onClose, onAdded }: { onClose: () => void; onAdded: (e: Employee) => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [salary, setSalary] = useState("");
  const [joinedOn, setJoinedOn] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, phone, monthly_salary: salary || null, joined_on: joinedOn || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save employee");
      onAdded(data.employee);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold mb-3">Add an employee</h2>
        {error && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 mb-3">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Name *</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Role</span>
            <input className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Counter staff" />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Phone</span>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-muted mb-1">Monthly salary (₹)</span>
              <input className="input" type="number" step="0.01" value={salary} onChange={(e) => setSalary(e.target.value)} />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-muted mb-1">Joined on</span>
              <input className="input" type="date" value={joinedOn} onChange={(e) => setJoinedOn(e.target.value)} />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save employee"}
          </button>
        </div>
      </div>
    </div>
  );
}
