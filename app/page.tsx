import { Warehouse } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6">
      <div className="max-w-2xl text-center space-y-8">
        <div className="flex justify-center">
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Warehouse className="w-16 h-16 text-amber-400" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Udaipur Warehouse Hub
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
          15,000 sq ft Grade-A Warehouse
          <br />
          <span className="text-amber-400 font-medium">
            Gukhar Magri, on NH Golden Quadrilateral
          </span>
        </p>

        <div className="pt-4">
          <span className="inline-block px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-sm font-medium tracking-widest uppercase">
            Launching Soon
          </span>
        </div>
      </div>

      <footer className="absolute bottom-8 text-slate-500 text-sm">
        Aviral India
      </footer>
    </div>
  )
}
