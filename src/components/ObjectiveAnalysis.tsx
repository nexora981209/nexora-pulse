import type { Campaign, CampaignObjective } from '../data/mockData'

interface Props {
  campaigns: Campaign[]
}

const OBJECTIVE_CONFIG: Record<CampaignObjective, {
  label: string
  icon: string
  color: string
  bg: string
  border: string
  kpis: string[]
  benchmarks: Record<string, string>
}> = {
  conversions: {
    label: 'Conversiones',
    icon: '🛒',
    color: 'text-blue-400',
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
    kpis: ['ROAS', 'CPA', 'Conv. Rate'],
    benchmarks: { ROAS: '≥ 3x', CPA: '< $15', 'Conv. Rate': '≥ 5%' },
  },
  traffic: {
    label: 'Tráfico',
    icon: '🌐',
    color: 'text-purple-400',
    bg: 'bg-purple-500/5',
    border: 'border-purple-500/20',
    kpis: ['CTR', 'CPC', 'Frecuencia'],
    benchmarks: { CTR: '≥ 2%', CPC: '< $0.30', Frecuencia: '1–2' },
  },
  awareness: {
    label: 'Awareness',
    icon: '📢',
    color: 'text-amber-400',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    kpis: ['Alcance', 'CPM', 'Frecuencia'],
    benchmarks: { Alcance: 'máximo', CPM: '< $8', Frecuencia: '2–4' },
  },
  engagement: {
    label: 'Engagement',
    icon: '❤️',
    color: 'text-pink-400',
    bg: 'bg-pink-500/5',
    border: 'border-pink-500/20',
    kpis: ['Engagement Rate', 'CPC', 'CTR'],
    benchmarks: { 'Engagement Rate': '≥ 2%', CPC: '< $0.20', CTR: '≥ 1.5%' },
  },
  leads: {
    label: 'Generación Leads',
    icon: '📋',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    kpis: ['CPL', 'CTR', 'Conv. Rate'],
    benchmarks: { CPL: '< $5', CTR: '≥ 2%', 'Conv. Rate': '≥ 8%' },
  },
}

function groupByObjective(campaigns: Campaign[]) {
  const groups: Partial<Record<CampaignObjective, Campaign[]>> = {}
  for (const c of campaigns) {
    if (!groups[c.objective]) groups[c.objective] = []
    groups[c.objective]!.push(c)
  }
  return groups
}

function avgMetric(campaigns: Campaign[], key: keyof Campaign): number {
  const vals = campaigns.map(c => c[key] as number).filter(v => v > 0)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}

export default function ObjectiveAnalysis({ campaigns }: Props) {
  const groups = groupByObjective(campaigns)

  return (
    <div className="bg-[#1a1b25] rounded-2xl border border-white/5">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🎯 Análisis por Objetivo
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">Cada objetivo tiene sus propios benchmarks — no los mezcles</p>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {(Object.entries(groups) as [CampaignObjective, Campaign[]][]).map(([objective, camps]) => {
          const cfg = OBJECTIVE_CONFIG[objective]
          const avgRoas = avgMetric(camps, 'roas')
          const avgCtr = avgMetric(camps, 'ctr')
          const avgCpa = avgMetric(camps, 'cpa')
          const avgFreq = avgMetric(camps, 'frequency')
          const totalSpend = camps.reduce((s, c) => s + c.spend, 0)
          const totalConv = camps.reduce((s, c) => s + c.conversions, 0)
          const healthy = camps.filter(c => c.health === 'optimal').length
          const total = camps.length

          return (
            <div key={objective} className={`rounded-xl p-4 border ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cfg.icon}</span>
                  <span className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-xs text-gray-600">({total} campaña{total > 1 ? 's' : ''})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 rounded-full bg-white/5 w-20">
                    <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${(healthy / total) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{healthy}/{total} sanas</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {objective === 'conversions' && <>
                  <Stat label="ROAS prom." value={avgRoas.toFixed(1) + 'x'} good={avgRoas >= 3} />
                  <Stat label="CPA prom." value={'$' + avgCpa.toFixed(1)} good={avgCpa <= 15} invert />
                  <Stat label="CTR prom." value={avgCtr.toFixed(1) + '%'} good={avgCtr >= 2} />
                  <Stat label="Frecuencia" value={avgFreq.toFixed(1)} good={avgFreq <= 3} invert />
                </>}
                {objective === 'traffic' && <>
                  <Stat label="CTR prom." value={avgCtr.toFixed(1) + '%'} good={avgCtr >= 2} />
                  <Stat label="Frecuencia" value={avgFreq.toFixed(1)} good={avgFreq <= 2} invert />
                  <Stat label="Gasto total" value={'$' + totalSpend} good />
                  <Stat label="Conversiones" value={String(totalConv)} good />
                </>}
                {objective === 'awareness' && <>
                  <Stat label="Frecuencia" value={avgFreq.toFixed(1)} good={avgFreq >= 2 && avgFreq <= 4} />
                  <Stat label="CTR prom." value={avgCtr.toFixed(1) + '%'} good={avgCtr >= 0.5} />
                  <Stat label="Gasto total" value={'$' + totalSpend} good />
                  <Stat label="Campañas" value={String(total)} good />
                </>}
                {objective === 'engagement' && <>
                  <Stat label="CTR prom." value={avgCtr.toFixed(1) + '%'} good={avgCtr >= 1.5} />
                  <Stat label="Frecuencia" value={avgFreq.toFixed(1)} good={avgFreq <= 3} invert />
                  <Stat label="Conversiones" value={String(totalConv)} good />
                  <Stat label="Gasto total" value={'$' + totalSpend} good />
                </>}
                {objective === 'leads' && <>
                  <Stat label="CPL prom." value={'$' + avgCpa.toFixed(1)} good={avgCpa <= 5} invert />
                  <Stat label="CTR prom." value={avgCtr.toFixed(1) + '%'} good={avgCtr >= 2} />
                  <Stat label="Leads" value={String(totalConv)} good />
                  <Stat label="Gasto total" value={'$' + totalSpend} good />
                </>}
              </div>

              <div className="flex flex-wrap gap-2">
                <p className="text-xs text-gray-600 w-full">Benchmarks para este objetivo:</p>
                {Object.entries(cfg.benchmarks).map(([k, v]) => (
                  <span key={k} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {k}: <span className={cfg.color}>{v}</span>
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, good, invert }: { label: string; value: string; good: boolean; invert?: boolean }) {
  const isGood = invert ? !good : good
  return (
    <div className="bg-black/20 rounded-lg p-2.5 text-center">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${isGood ? 'text-emerald-400' : 'text-amber-400'}`}>{value}</p>
    </div>
  )
}
