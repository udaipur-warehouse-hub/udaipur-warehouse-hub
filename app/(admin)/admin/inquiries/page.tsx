'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Mail, Phone, Building2, Clock, MessageSquare, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Card, { CardContent } from '@/components/ui/card'
import type { Inquiry } from '@/types'
import { formatDistanceToNow, format } from 'date-fns'

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'converted', label: 'Converted' },
  { value: 'rejected', label: 'Rejected' },
]

const statusFlow = ['new', 'contacted', 'negotiating', 'converted', 'rejected']

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Inquiry | null>(null)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchInquiries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function fetchInquiries() {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setInquiries(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, newStatus: string) {
    setUpdating(true)
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    if (res.ok) {
      const updated = await res.json()
      setInquiries((prev) => prev.map((i) => (i.id === id ? updated : i)))
      if (selected?.id === id) setSelected(updated)
    }
    setUpdating(false)
  }

  async function saveNotes(id: string) {
    setUpdating(true)
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })

    if (res.ok) {
      const updated = await res.json()
      setInquiries((prev) => prev.map((i) => (i.id === id ? updated : i)))
      setSelected(updated)
    }
    setUpdating(false)
  }

  async function deleteInquiry(id: string) {
    if (!confirm('Are you sure you want to delete this inquiry?')) return

    const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setInquiries((prev) => prev.filter((i) => i.id !== id))
      if (selected?.id === id) setSelected(null)
    }
  }

  const filtered = inquiries.filter((i) =>
    search
      ? i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.email.toLowerCase().includes(search.toLowerCase()) ||
        (i.company_name || '').toLowerCase().includes(search.toLowerCase())
      : true
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Inquiries</h1>
        <p className="text-slate-400 text-sm mt-1">Manage warehouse rental inquiries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-slate-500 text-center py-8">No inquiries found</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((inquiry) => (
              <div
                key={inquiry.id}
                onClick={() => {
                  setSelected(inquiry)
                  setNotes(inquiry.notes || '')
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selected?.id === inquiry.id
                    ? 'bg-slate-800 border-amber-500/30'
                    : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium text-sm truncate">{inquiry.name}</p>
                      <Badge status={inquiry.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {inquiry.company_name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {inquiry.company_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {inquiry.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-96 shrink-0">
            <Card className="sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">{selected.name}</h2>
                <button
                  onClick={() => deleteInquiry(selected.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${selected.email}`} className="text-amber-400 hover:underline">
                      {selected.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${selected.phone}`} className="text-amber-400 hover:underline">
                      {selected.phone}
                    </a>
                  </div>
                  {selected.company_name && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Building2 className="w-4 h-4" />
                      {selected.company_name}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-700/50 pt-4 space-y-2">
                  {selected.space_required && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Space</span>
                      <span className="text-white">{selected.space_required}</span>
                    </div>
                  )}
                  {selected.duration && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Duration</span>
                      <span className="text-white">{selected.duration}</span>
                    </div>
                  )}
                  {selected.purpose && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Purpose</span>
                      <span className="text-white capitalize">{selected.purpose}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Submitted</span>
                    <span className="text-white">
                      {format(new Date(selected.created_at), 'dd MMM yyyy, h:mm a')}
                    </span>
                  </div>
                </div>

                {selected.message && (
                  <div className="border-t border-slate-700/50 pt-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                      <MessageSquare className="w-3 h-3" />
                      Message
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{selected.message}</p>
                  </div>
                )}

                {/* Status Update */}
                <div className="border-t border-slate-700/50 pt-4">
                  <p className="text-slate-500 text-xs mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {statusFlow.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        disabled={updating || selected.status === s}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                          selected.status === s
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 border border-slate-600/50'
                        } disabled:opacity-50`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="border-t border-slate-700/50 pt-4">
                  <p className="text-slate-500 text-xs mb-2">Internal Notes</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this inquiry..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={() => saveNotes(selected.id)}
                    loading={updating}
                    className="mt-2"
                  >
                    Save Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
