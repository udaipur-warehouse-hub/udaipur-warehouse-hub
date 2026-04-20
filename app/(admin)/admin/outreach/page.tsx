'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Send, Mail, Building2, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Card, { CardContent } from '@/components/ui/card'
import type { OutreachTarget } from '@/types/outreach'

const industries = [
  'Paints & Coatings', 'Building Materials', 'Marble & Granite',
  'Quick Commerce', 'FMCG', 'Logistics', 'Distribution', 'E-commerce',
  'Manufacturing', 'Pharmaceuticals', 'Chemicals', 'Agriculture',
  'Retail', 'Cold Storage', 'Other',
]

export default function OutreachPage() {
  const [targets, setTargets] = useState<OutreachTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({
    company_name: '', industry: '', contact_name: '', contact_email: '', city: '', notes: '',
  })

  useEffect(() => {
    fetchTargets()
  }, [])

  async function fetchTargets() {
    setLoading(true)
    const res = await fetch('/api/targets')
    if (res.ok) setTargets(await res.json())
    setLoading(false)
  }

  async function addTarget(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ company_name: '', industry: '', contact_name: '', contact_email: '', city: '', notes: '' })
      setShowForm(false)
      fetchTargets()
    }
  }

  async function runOutreach() {
    setSending(true)
    const res = await fetch('/api/outreach/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'outreach' }),
    })
    const data = await res.json()
    alert(`Outreach complete: ${data.sent || 0} emails sent`)
    setSending(false)
    fetchTargets()
  }

  async function deleteTarget(id: string) {
    if (!confirm('Delete this target?')) return
    const supabase = createClient()
    await supabase.from('outreach_targets').delete().eq('id', id)
    setTargets((prev) => prev.filter((t) => t.id !== id))
  }

  const stats = {
    total: targets.length,
    pending: targets.filter((t) => t.status === 'pending').length,
    emailed: targets.filter((t) => t.status === 'emailed').length,
    replied: targets.filter((t) => t.status === 'replied').length,
    interested: targets.filter((t) => t.status === 'interested').length,
    converted: targets.filter((t) => t.status === 'converted').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Outreach Autopilot</h1>
          <p className="text-slate-400 text-sm mt-1">Add target companies, AI sends personalized emails</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Target
          </Button>
          <Button onClick={runOutreach} loading={sending}>
            <Send className="w-4 h-4 mr-2" />
            Run Outreach Now
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-300' },
          { label: 'Pending', value: stats.pending, color: 'text-blue-400' },
          { label: 'Emailed', value: stats.emailed, color: 'text-yellow-400' },
          { label: 'Replied', value: stats.replied, color: 'text-purple-400' },
          { label: 'Interested', value: stats.interested, color: 'text-green-400' },
          { label: 'Converted', value: stats.converted, color: 'text-amber-400' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Target Form */}
      {showForm && (
        <Card>
          <form onSubmit={addTarget} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                placeholder="Company Name *"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                required
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <select
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                required
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="">Industry *</option>
                {industries.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <input
                placeholder="Contact Email *"
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                required
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                placeholder="Contact Name"
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <input
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <input
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <Button type="submit" size="sm">Add Target</Button>
          </form>
        </Card>
      )}

      {/* Targets List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full" />
        </div>
      ) : targets.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No targets yet</p>
              <p className="text-slate-500 text-sm">Add companies you want to reach out to</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {targets.map((target) => (
            <div
              key={target.id}
              className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-white font-medium text-sm">{target.company_name}</p>
                  <Badge status={target.status} />
                  <span className="text-xs text-slate-500">{target.industry}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {target.contact_email}
                  </span>
                  {target.contact_name && <span>{target.contact_name}</span>}
                  {target.city && <span>{target.city}</span>}
                </div>
              </div>
              <button
                onClick={() => deleteTarget(target.id)}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
