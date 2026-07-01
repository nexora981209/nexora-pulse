import type { MetricConfig } from '../data/mockData'
import type { MetricStatus } from '../utils/scoring'
import { getMetricStatus, getProgressPercent } from '../utils/scoring'

interface Props {
  config: MetricConfig
  value: number
}

const statusColors: Record<MetricStatus, { badge: string; bar: string; glow: string }> = {
  optimal: { badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', bar: 'bg-emerald-500', glow: 'shadow-emerald-500/10' },
  warning: { badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30', bar: 'bg-amber-500', glow: 'shadow-amber-500/10' },
  critical: { badge: 'bg-red-500/20 text-red-400 border border-red-500/30', bar: 'bg-red-500', glow: 'shadow-red-500/10' },
}

const statusLabels: Record<MetricStatus, string> = {
  optimal: 'Óptimo',
  warning: 'Atención',
  critical: 'Crítico',
}

export default function KPICard({ config, value }: Props) {
  const status = getMetricStatus(config.key, value)
  const progress = getProgressPercent(config.key, value)
  const colors = statusColors[status]

  return (
    <div className={`bg-[#1a1b25] rounded-2xl p-5 border border-white/5 shadow-xl ${colors.glow} hover:border-white/10 transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-gray-400 text-sm font-medium leading-tight">{config.label}</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
          {statusLabels[status]}
        </span>
      </div>

      <p className="text-3xl font-bold text-white mb-1">{config.format(value)}</p>
      <p className="text-xs text-gray-500 mb-4">Ideal: {config.idealLabel}</p>

      <div className="w-full bg-white/5 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
