import { Warehouse, MapPin, ArrowDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-3xl text-center space-y-8">
        <div className="flex justify-center">
          <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 backdrop-blur-sm">
            <Warehouse className="w-16 h-16 text-amber-400" />
          </div>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
          Udaipur{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
            Warehouse Hub
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
          15,000 sq ft Grade-A warehouse space, ready for your business
        </p>

        <div className="flex items-center justify-center gap-2 text-amber-400">
          <MapPin className="w-5 h-5" />
          <span className="text-lg">Gukhar Magri, NH Golden Quadrilateral, Udaipur</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a
            href="#inquiry"
            className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors text-lg"
          >
            Inquire Now
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 border border-slate-600 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors text-lg"
          >
            Learn More
          </a>
        </div>
      </div>

      <a href="#features" className="absolute bottom-8 animate-bounce">
        <ArrowDown className="w-6 h-6 text-slate-500" />
      </a>
    </section>
  )
}
