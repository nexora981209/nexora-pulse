interface Props {
  score: number
}

export default function HealthScore({ score }: Props) {
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? 'Saludable' : score >= 45 ? 'Necesita atención' : 'En riesgo'
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="bg-[#1a1b25] rounded-2xl p-6 border border-white/5 shadow-xl flex items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-1">Score de Salud</p>
        <h2 className="text-2xl font-bold text-white mb-1">{label}</h2>
        <p className="text-sm text-gray-400 max-w-xs">
          {score >= 70
            ? 'Tus campañas están funcionando dentro de los parámetros óptimos. Sigue escalando lo que funciona.'
            : score >= 45
            ? 'Hay métricas que requieren atención. Revisa las alertas de diagnóstico para priorizar acciones.'
            : 'Varias métricas están en zona crítica. Acción inmediata requerida para detener pérdidas.'}
        </p>
        <div className="flex gap-3 mt-3">
          <Pill color="#10b981" label="Óptimo ≥70" />
          <Pill color="#f59e0b" label="Atención 45–69" />
          <Pill color="#ef4444" label="Riesgo <45" />
        </div>
      </div>
    </div>
  )
}

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}
