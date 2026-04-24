'use client'

import { useState, useRef, useEffect } from 'react'
import { LayoutGrid, Scale, Trophy, Building2, Warehouse } from 'lucide-react'

const apps = [
  {
    name: 'Advocate Hub',
    icon: Scale,
    url: 'https://advocate-diary-hub-orpin.vercel.app/auth/auto-login?key=94c1a5172f3a7c1c7e766d1970db46fa41d3dbeb32cdcab7&redirect=/diary',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    current: false,
  },
  {
    name: 'Sports Club',
    icon: Trophy,
    url: 'https://usc-platform-beta.vercel.app/auth/auto-login?key=94c1a5172f3a7c1c7e766d1970db46fa41d3dbeb32cdcab7&redirect=/dashboard',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    current: false,
  },
  {
    name: 'Metro ERP',
    icon: Building2,
    url: 'https://metro-erp.vercel.app/api/auth/auto-login?key=94c1a5172f3a7c1c7e766d1970db46fa41d3dbeb32cdcab7&redirect=/dashboard',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    current: false,
  },
  {
    name: 'Warehouse Hub',
    icon: Warehouse,
    url: '#',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    current: true,
  },
]

export function AppSwitcher() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        title="Switch app"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute left-0 bottom-full mb-2 w-52 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl shadow-black/30 p-2 z-50">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider px-2 py-1.5 mb-1">
            Switch App
          </div>
          {apps.map((app) => (
            <a
              key={app.name}
              href={app.current ? undefined : app.url}
              onClick={app.current ? () => setOpen(false) : undefined}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                app.current
                  ? 'bg-amber-500/10 text-amber-400 cursor-default'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-md ${app.bg}`}>
                <app.icon className={`w-4 h-4 ${app.color}`} />
              </div>
              <span>{app.name}</span>
              {app.current && (
                <span className="ml-auto text-[10px] text-amber-500/70 font-medium">
                  Current
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
