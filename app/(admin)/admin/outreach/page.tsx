'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Send, Mail, Building2, Trash2, Clock, RefreshCw } from 'lucide-react'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Card, { CardContent } from '@/components/ui/card'
import type { OutreachTarget } from '@/types/outreach'
import { formatDistanceToNow } from 'date-fns'

interface EmailLog {
  id: string
  company_name: string
  to_email: string
  subject: string
  status: string
  email_type: string
  created_at: string
}

const industries = [
  'Paints & Coatings', 'Building Materials', 'Marble & Granite',
  'Quick Commerce', 'FMCG', 'Logistics', 'Distribution', 'E-commerce',
  'Manufacturing', 'Pharmaceuticals', 'Chemicals', 'Agriculture',
  'Retail', 'Cold Storage', 'Other',
]

export default function OutreachPage() {
  const [targets, setTargets] = useState<OutreachTarget[]>([])
  const [recentLogs, setRecentLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [showForm, setShowForm] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({
    company_name: '', industry: '', contact_name: '', contact_email: '', city: '', notes: '',
  })

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const [targetsRes, logsRes] = await Promise.all([
      fetch('/api/targets'),
      supabase
        .from('email_log')
        .select('id, to_email, subject, status, email_type, created_at, target_id, outreach_targets(company_name)')
        .in('email_type', ['cold_outreach', 'follow_up'])
        .order('created_at', { ascending: false })
        .limit(10),
    ])
    if (targetsRes.ok) setTargets(await targetsRes.json())
    if (logsRes.data) {
      setRecentLogs(logsRes.data.map((l: any) => ({
        id: l.id,
        company_name: l.outreach_targets?.company_name || l.to_email,
        to_email: l.to_email,
        subject: l.subject,
        status: l.status,
        email_type: l.email_type,
        created_at: l.created_at,
      })))
    }
    setLastRefreshed(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

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
          <p className="text-slate-400 text-sm mt-1">
            Emails go out Mon–Fri at 9 AM IST · Daily limit: 2 emails (week 1), increases weekly
            <span className="ml-3 text-slate-600">· Refreshed {formatDistanceToNow(lastRefreshed, { addSuffix: true })}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Target
          </Button>
          <Button onClick={runOutreach} loading={sending}>
            <Send className="w-4 h-4 mr-2" />
            Send Now
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

      {/* Recent Activity */}
      {recentLogs.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Recent Emails Sent</h2>
          </div>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{log.company_name}</p>
                  <p className="text-slate-500 text-xs truncate">{log.subject}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${log.status === 'sent' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {log.email_type === 'follow_up' ? 'follow-up' : 'outreach'} · {log.status}
                  </span>
                  <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </div>
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
