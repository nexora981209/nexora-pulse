import type { Diagnosis, MetricStatus } from '../utils/scoring'

interface Props {
  diagnoses: Diagnosis[]
}

const statusStyle: Record<MetricStatus, { border: string; icon: string; title: string }> = {
  critical: { border: 'border-red-500/40 bg-red-500/5', icon: '🚨', title: 'text-red-400' },
  warning: { border: 'border-amber-500/40 bg-amber-500/5', icon: '⚠️', title: 'text-amber-400' },
  optimal: { border: 'border-emerald-500/40 bg-emerald-500/5', icon: '✅', title: 'text-emerald-400' },
}

export default function DiagnosticPanel({ diagnoses }: Props) {
  if (diagnoses.length === 0) {
    return (
      <div className="bg-[#1a1b25] rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-2">Diagnóstico Automático</h3>
        <p className="text-emerald-400 flex items-center gap-2"><span>✅</span> Todo en orden. No se detectaron alertas.</p>
      </div>
    )
  }

  const critical = diagnoses.filter((d) => d.status === 'critical')
  const warnings = diagnoses.filter((d) => d.status === 'warning')

  return (
    <div className="bg-[#1a1b25] rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-white">Diagnóstico Automático</h3>
          <p className="text-sm text-gray-500 mt-0.5">Análisis basado en benchmarks de Meta Ads</p>
        </div>
        <div className="flex gap-2">
          {critical.length > 0 && (
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-semibold">
              {critical.length} crítico{critical.length > 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-semibold">
              {warnings.length} alerta{warnings.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {[...critical, ...warnings].map((d, i) => {
          const s = statusStyle[d.status]
          return (
            <div key={i} className={`rounded-xl p-4 border ${s.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{d.icon}</span>
                <span className={`font-semibold text-sm ${s.title}`}>{d.metric}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${
                  d.status === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {d.status === 'critical' ? 'Crítico' : 'Atención'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                <span className="text-gray-300 font-medium">Causa: </span>{d.cause}
              </p>
              <p className="text-sm text-gray-400">
                <span className="text-blue-400 font-medium">✦ Solución: </span>{d.solution}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
