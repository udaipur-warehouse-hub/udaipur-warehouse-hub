import { MapPin, Navigation, Clock, Phone } from 'lucide-react'

const details = [
  { icon: MapPin, label: 'Address', value: 'Gukhar Magri, NH-48 Golden Quadrilateral, Udaipur, Rajasthan 313001' },
  { icon: Navigation, label: 'Connectivity', value: 'Directly on National Highway, 15 min from Udaipur city center' },
  { icon: Clock, label: 'Access Hours', value: '24/7 access available for tenants' },
  { icon: Phone, label: 'Contact', value: 'Submit inquiry below or call for site visit' },
]

export default function Location() {
  return (
    <section id="location" className="py-24 px-6 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prime Location
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Strategically located on the NH Golden Quadrilateral connecting
            Delhi, Mumbai, Chennai, and Kolkata
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Map placeholder */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">Gukhar Magri, Udaipur</p>
              <p className="text-slate-500 text-sm">NH-48, Golden Quadrilateral</p>
              <a
                href="https://maps.google.com/?q=Gukhar+Magri+Udaipur+Rajasthan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-colors text-sm"
              >
                <Navigation className="w-4 h-4" />
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {details.map((detail) => (
              <div key={detail.label} className="flex gap-4 items-start">
                <div className="p-3 bg-amber-500/10 rounded-lg shrink-0">
                  <detail.icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{detail.label}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{detail.value}</p>
                </div>
              </div>
            ))}

            <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl">
              <h3 className="text-white font-semibold mb-2">Schedule a Site Visit</h3>
              <p className="text-slate-400 text-sm mb-4">
                See the warehouse in person. We&apos;ll arrange a guided tour at your convenience.
              </p>
              <a
                href="#inquiry"
                className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors text-sm"
              >
                Book a Visit
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
