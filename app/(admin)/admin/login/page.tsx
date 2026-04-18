'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Warehouse, LogIn } from 'lucide-react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Warehouse className="w-10 h-10 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-slate-400 text-sm mt-1">Udaipur Warehouse Hub</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" loading={loading} className="w-full">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </form>

        <p className="text-center text-slate-600 text-xs mt-6">
          Contact the owner if you need access
        </p>
      </div>
    </div>
  )
}
