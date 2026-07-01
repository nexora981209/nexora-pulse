import type { Campaign } from '../data/mockData'

interface Props {
  campaigns: Campaign[]
}

const healthDot: Record<Campaign['health'], string> = {
  optimal: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
}

const healthLabel: Record<Campaign['health'], string> = {
  optimal: 'Óptimo',
  warning: 'Atención',
  critical: 'Crítico',
}

const statusBadge: Record<Campaign['status'], string> = {
  active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  paused: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  ended: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
}

const statusLabel: Record<Campaign['status'], string> = {
  active: 'Activa',
  paused: 'Pausada',
  ended: 'Finalizada',
}

export default function CampaignTable({ campaigns }: Props) {
  return (
    <div className="bg-[#1a1b25] rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold text-white">Campañas</h3>
        <p className="text-sm text-gray-500 mt-0.5">Semáforo de salud por campaña</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-white/5">
              {['Campaña', 'Estado', 'Presupuesto', 'Gasto', 'ROAS', 'CTR', 'CPA', 'Conv.', 'Salud'].map((h) => (
                <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c, i) => (
              <tr key={i} className="border-t border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3.5 text-gray-200 font-medium max-w-[220px]">
                  <span className="truncate block">{c.name}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge[c.status]}`}>
                    {statusLabel[c.status]}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-gray-400">${c.budget}</td>
                <td className="px-4 py-3.5 text-gray-400">${c.spend}</td>
                <td className={`px-4 py-3.5 font-semibold ${c.roas >= 3 ? 'text-emerald-400' : c.roas >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                  {c.roas.toFixed(1)}x
                </td>
                <td className={`px-4 py-3.5 font-semibold ${c.ctr >= 2 ? 'text-emerald-400' : c.ctr >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
                  {c.ctr.toFixed(1)}%
                </td>
                <td className={`px-4 py-3.5 font-semibold ${c.cpa <= 15 ? 'text-emerald-400' : c.cpa <= 25 ? 'text-amber-400' : 'text-red-400'}`}>
                  ${c.cpa.toFixed(1)}
                </td>
                <td className="px-4 py-3.5 text-gray-400">{c.conversions}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${healthDot[c.health]} shadow-lg`} style={{ boxShadow: `0 0 6px ${c.health === 'optimal' ? '#10b981' : c.health === 'warning' ? '#f59e0b' : '#ef4444'}` }} />
                    <span className={`text-xs font-medium ${c.health === 'optimal' ? 'text-emerald-400' : c.health === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
                      {healthLabel[c.health]}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
