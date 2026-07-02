interface Props {
  hasData: boolean
  hasViewedAlerts: boolean
  hasDownloaded: boolean
}

export default function ProgressGuide({ hasData, hasViewedAlerts, hasDownloaded }: Props) {
  const steps = [
    { label: 'Subiste tus datos', done: hasData, icon: '📥' },
    { label: 'Revisaste las alertas', done: hasViewedAlerts, icon: '🔍' },
    { label: 'Descargaste tu reporte', done: hasDownloaded, icon: '📄' },
  ]

  const completed = steps.filter(s => s.done).length
  const pct = Math.round((completed / steps.length) * 100)

  if (completed === steps.length) return (
    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-3 flex items-center gap-3">
      <span className="text-xl">🎉</span>
      <div>
        <p className="text-emerald-400 font-semibold text-sm">¡Análisis completo!</p>
        <p className="text-emerald-400/60 text-xs">Tu reporte está listo para compartir con tu equipo</p>
      </div>
    </div>
  )

  return (
    <div className="bg-[#1a1b25] border border-white/5 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-semibold text-sm">Completa tu análisis</p>
        <span className="text-xs text-gray-500">{completed}/{steps.length} pasos</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/5 rounded-full h-1.5 mb-4">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex gap-3">
        {steps.map((s, i) => (
          <div key={i} className={`flex items-center gap-2 flex-1 rounded-xl px-3 py-2 border ${s.done ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/3 border-white/5'}`}>
            <span className="text-base">{s.done ? '✅' : s.icon}</span>
            <span className={`text-xs font-medium leading-tight ${s.done ? 'text-emerald-400' : 'text-gray-400'}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
