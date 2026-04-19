const stats = [
  { value: '15,000', label: 'Sq Ft Area', suffix: '' },
  { value: '30', label: 'Ft Ceiling Height', suffix: '' },
  { value: 'NH-48', label: 'Highway Access', suffix: '' },
  { value: '100%', label: 'Power Backup', suffix: '' },
]

export default function Stats() {
  return (
    <section className="py-16 px-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-y border-amber-500/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-amber-400 mb-2">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-slate-400 text-sm uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
