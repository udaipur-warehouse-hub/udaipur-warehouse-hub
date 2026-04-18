import { Warehouse } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-slate-900 border-t border-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Warehouse className="w-6 h-6 text-amber-400" />
            <span className="text-white font-semibold">Udaipur Warehouse Hub</span>
          </div>
          <div className="text-slate-500 text-sm text-center sm:text-right">
            <p>Gukhar Magri, NH Golden Quadrilateral, Udaipur, Rajasthan</p>
            <p className="mt-1">&copy; {new Date().getFullYear()} Aviral India. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
