'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, UserCheck, Handshake, CheckCircle, XCircle, TrendingUp, Send, MailOpen, BarChart2 } from 'lucide-react'
import Card, { CardContent } from '@/components/ui/card'
import type { DashboardStats, Inquiry } from '@/types'
import Badge from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

const statCards = [
  { key: 'total_inquiries', label: 'Total Inquiries', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { key: 'new_inquiries', label: 'New', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { key: 'contacted', label: 'Contacted', icon: UserCheck, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { key: 'negotiating', label: 'Negotiating', icon: Handshake, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { key: 'converted', label: 'Converted', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const [statsRes, inquiriesRes] = await Promise.all([
        fetch('/api/stats'),
        supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      if (statsRes.ok) {
        setStats(await statsRes.json())
      }

      if (inquiriesRes.data) {
        setRecentInquiries(inquiriesRes.data)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-amber-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of your warehouse inquiries</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.key}>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {stats ? stats[stat.key as keyof DashboardStats] : 0}
                  </p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Outreach Performance */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">Outreach Autopilot</h2>
          <Link href="/admin/outreach" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">Manage →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Sent Today', value: stats?.outreach_sent_today ?? 0, icon: Send, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Total Sent', value: stats?.outreach_total_sent ?? 0, icon: MailOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Replied', value: stats?.outreach_replied ?? 0, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Reply Rate', value: `${stats?.outreach_reply_rate ?? 0}%`, icon: BarChart2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.bg}`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Inquiries */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Inquiries</h2>
          <Link
            href="/admin/inquiries"
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            View all
          </Link>
        </div>
        <CardContent>
          {recentInquiries.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No inquiries yet</p>
          ) : (
            <div className="space-y-3">
              {recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-white font-medium text-sm truncate">{inquiry.name}</p>
                      <Badge status={inquiry.status} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      {inquiry.company_name && `${inquiry.company_name} · `}
                      {inquiry.email} · {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
