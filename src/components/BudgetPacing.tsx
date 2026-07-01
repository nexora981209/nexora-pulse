import type { Campaign } from '../data/mockData'

interface Props {
  campaigns: Campaign[]
}

type PacingStatus = 'overpacing' | 'underpacing' | 'on-track'

interface PacingInfo {
  campaign: Campaign
  expectedSpend: number
  actualSpend: number
  pacingPct: number
  status: PacingStatus
  message: string
  daysLeft: number
  projectedMonthlySpend: number
}

function calcPacing(c: Campaign): PacingInfo {
  const progressPct = c.daysElapsed / c.daysTotal
  const expectedSpend = c.monthlyBudget * progressPct
  const actualSpend = c.spend
  const pacingPct = expectedSpend > 0 ? (actualSpend / expectedSpend) * 100 : 100
  const daysLeft = c.daysTotal - c.daysElapsed
  const dailyRate = c.spend / c.daysElapsed
  const projectedMonthlySpend = c.spend + dailyRate * daysLeft

  let status: PacingStatus
  let message: string

  if (pacingPct > 115) {
    status = 'overpacing'
    message = `Vas ${(pacingPct - 100).toFixed(0)}% por encima del ritmo. Reducirás el presupuesto antes de fin de mes.`
  } else if (pacingPct < 80) {
    status = 'underpacing'
    message = `Vas ${(100 - pacingPct).toFixed(0)}% por debajo del ritmo. El presupuesto no se aprovechará completo.`
  } else {
    status = 'on-track'
    message = 'Pacing correcto. El gasto está alineado con el ritmo esperado.'
  }

  return { campaign: c, expectedSpend, actualSpend, pacingPct, status, message, daysLeft, projectedMonthlySpend }
}

const statusStyle: Record<PacingStatus, { color: string; bg: string; border: string; bar: string }> = {
  'overpacing':  { color: 'text-red-400',     bg: 'bg-red-500/5',     border: 'border-red-500/30',    bar: 'bg-red-500' },
  'underpacing': { color: 'text-amber-400',   bg: 'bg-amber-500/5',   border: 'border-amber-500/30',  bar: 'bg-amber-500' },
  'on-track':    { color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', bar: 'bg-emerald-500' },
}

const statusLabel: Record<PacingStatus, string> = {
  'overpacing': '🔴 Overpacing',
  'underpacing': '🟡 Underpacing',
  'on-track': '🟢 En ritmo',
}

export default function BudgetPacing({ campaigns }: Props) {
  const pacings = campaigns
    .filter(c => c.status === 'active')
    .map(calcPacing)
    .sort((a, b) => {
      const order = { overpacing: 0, underpacing: 1, 'on-track': 2 }
      return order[a.status] - order[b.status]
    })

  const totalMonthlyBudget = campaigns.reduce((s, c) => s + c.monthlyBudget, 0)
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalProjected = pacings.reduce((s, p) => s + p.projectedMonthlySpend, 0)
  const overallPacing = (totalSpend / (totalMonthlyBudget * (campaigns[0]?.daysElapsed / campaigns[0]?.daysTotal || 0.6))) * 100

  return (
    <div className="bg-[#1a1b25] rounded-2xl border border-white/5">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          💰 Pacing de Presupuesto
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">¿Vas bien con el ritmo de gasto mensual?</p>
      </div>

      {/* Global summary */}
      <div className="px-6 mb-4 grid grid-cols-3 gap-3">
        <div className="bg-[#13141e] rounded-xl p-3 border border-white/5 text-center">
          <p className="text-xs text-gray-500 mb-1">Presupuesto mes</p>
          <p className="text-white font-bold">${totalMonthlyBudget.toLocaleString()}</p>
        </div>
        <div className="bg-[#13141e] rounded-xl p-3 border border-white/5 text-center">
          <p className="text-xs text-gray-500 mb-1">Gastado hasta hoy</p>
          <p className="text-white font-bold">${totalSpend.toLocaleString()}</p>
        </div>
        <div className="bg-[#13141e] rounded-xl p-3 border border-white/5 text-center">
          <p className="text-xs text-gray-500 mb-1">Proyección final</p>
          <p className={`font-bold ${totalProjected > totalMonthlyBudget * 1.1 ? 'text-red-400' : totalProjected < totalMonthlyBudget * 0.85 ? 'text-amber-400' : 'text-emerald-400'}`}>
            ${Math.round(totalProjected).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Global pacing bar */}
      <div className="px-6 mb-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Pacing global: {overallPacing.toFixed(0)}%</span>
          <span>Día {campaigns[0]?.daysElapsed} de {campaigns[0]?.daysTotal}</span>
        </div>
        <div className="relative h-2 bg-white/5 rounded-full">
          {/* Expected marker */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-white/30 rounded-full" style={{ left: `${(campaigns[0]?.daysElapsed / campaigns[0]?.daysTotal) * 100}%` }} />
          <div
            className={`h-2 rounded-full transition-all ${overallPacing > 115 ? 'bg-red-500' : overallPacing < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(100, overallPacing)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-600">0%</span>
          <span className="text-gray-500">↑ Esperado hoy</span>
          <span className="text-gray-600">100%</span>
        </div>
      </div>

      {/* Per-campaign */}
      <div className="px-6 pb-6 space-y-3">
        {pacings.map((p, i) => {
          const s = statusStyle[p.status]
          const barWidth = Math.min(100, p.pacingPct)

          return (
            <div key={i} className={`rounded-xl p-4 border ${s.bg} ${s.border}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{p.campaign.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.message}</p>
                </div>
                <span className={`text-xs font-bold flex-shrink-0 ${s.color}`}>{statusLabel[p.status]}</span>
              </div>

              <div className="flex gap-4 text-xs mb-2">
                <span className="text-gray-500">Esperado: <span className="text-gray-300">${Math.round(p.expectedSpend).toLocaleString()}</span></span>
                <span className="text-gray-500">Actual: <span className="text-gray-300">${p.actualSpend.toLocaleString()}</span></span>
                <span className="text-gray-500">Proyectado: <span className={s.color}>${Math.round(p.projectedMonthlySpend).toLocaleString()}</span></span>
              </div>

              <div className="relative h-1.5 bg-white/5 rounded-full">
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/20 rounded-full"
                  style={{ left: `${(p.campaign.daysElapsed / p.campaign.daysTotal) * 100}%` }} />
                <div className={`h-1.5 rounded-full ${s.bar}`} style={{ width: `${barWidth}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
