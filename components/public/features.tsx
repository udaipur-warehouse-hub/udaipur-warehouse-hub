import {
  Maximize,
  MapPin,
  Shield,
  Truck,
  Zap,
  Flame,
  Calendar,
  Route,
  LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Maximize, MapPin, Shield, Truck, Zap, Flame, Calendar, Route,
}

const defaultFeatures = [
  { title: '15,000 Sq Ft', description: 'Grade-A warehouse space with high ceiling clearance and open floor plan', icon: 'Maximize' },
  { title: 'NH Golden Quadrilateral', description: 'Prime location on National Highway at Gukhar Magri, Udaipur', icon: 'MapPin' },
  { title: 'Security Available', description: 'Guard and CCTV surveillance can be arranged if needed by the tenant', icon: 'Shield' },
  { title: 'Loading Docks', description: 'Multiple loading/unloading docks for trucks and heavy vehicles', icon: 'Truck' },
  { title: 'Power Backup', description: 'Uninterrupted power supply with industrial-grade backup generators', icon: 'Zap' },
  { title: 'Fire Safety Available', description: 'Fire safety systems including sprinklers and extinguishers can be arranged on request', icon: 'Flame' },
  { title: 'Flexible Leasing', description: 'Short-term and long-term lease options to suit your business needs', icon: 'Calendar' },
  { title: 'Easy Access', description: 'Wide approach road with easy access for heavy commercial vehicles', icon: 'Route' },
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why Choose Our Warehouse?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Premium warehouse facility with everything your business needs for
            storage, distribution, and logistics operations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {defaultFeatures.map((feature) => {
            const Icon = iconMap[feature.icon] || Maximize
            return (
              <div
                key={feature.title}
                className="group p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all duration-300"
              >
                <div className="p-3 bg-amber-500/10 rounded-lg w-fit mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
