import type { Campaign } from '../data/mockData'

interface Props {
  campaigns: Campaign[]
}

interface FatigueAlert {
  campaign: Campaign
  level: 'critical' | 'warning'
  reasons: string[]
  action: string
}

function detectFatigue(c: Campaign): FatigueAlert | null {
  const reasons: string[] = []
  let score = 0

  if (c.frequency >= 5) { reasons.push(`Frecuencia ${c.frequency.toFixed(1)} — muy alta`); score += 3 }
  else if (c.frequency >= 3.5) { reasons.push(`Frecuencia ${c.frequency.toFixed(1)} — en límite`); score += 1 }

  const firstCtr = c.ctrTrend[0]
  const lastCtr = c.ctrTrend[c.ctrTrend.length - 1]
  const ctrDrop = firstCtr > 0 ? ((firstCtr - lastCtr) / firstCtr) * 100 : 0
  if (ctrDrop >= 30) { reasons.push(`CTR cayó ${ctrDrop.toFixed(0)}% en 7 días`); score += 3 }
  else if (ctrDrop >= 15) { reasons.push(`CTR bajó ${ctrDrop.toFixed(0)}% en 7 días`); score += 1 }

  if (c.impressions > 50000 && c.frequency > 3) { reasons.push('Alta exposición con audiencia saturada'); score += 1 }

  if (score === 0) return null

  const level = score >= 4 ? 'critical' : 'warning'
  const action = level === 'critical'
    ? 'Pausa inmediata. Lanza 3–5 creativos nuevos con formato diferente (video corto, carrusel, UGC).'
    : 'Rota creativos esta semana. Agrega exclusión de personas que ya convirtieron.'

  return { campaign: c, level, reasons, action }
}

export default function CreativeFatigue({ campaigns }: Props) {
  const alerts = campaigns
    .filter(c => c.status === 'active')
    .map(detectFatigue)
    .filter((a): a is FatigueAlert => a !== null)
    .sort((a, b) => (a.level === 'critical' ? -1 : 1) - (b.level === 'critical' ? -1 : 1))

  return (
    <div className="bg-[#1a1b25] rounded-2xl border border-white/5">
      <div className="p-6 pb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🎨 Detector de Fatiga Creativa
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Detecta anuncios quemados antes de que destruyan tu ROAS</p>
        </div>
        <div className="flex gap-2">
          {alerts.filter(a => a.level === 'critical').length > 0 && (
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-semibold">
              {alerts.filter(a => a.level === 'critical').length} crítico{alerts.filter(a => a.level === 'critical').length > 1 ? 's' : ''}
            </span>
          )}
          {alerts.filter(a => a.level === 'warning').length > 0 && (
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-semibold">
              {alerts.filter(a => a.level === 'warning').length} alerta{alerts.filter(a => a.level === 'warning').length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-emerald-400 font-medium text-sm">Sin fatiga detectada</p>
            <p className="text-gray-600 text-xs mt-1">Todos los creativos activos están en buen estado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Mini CTR trend bars */}
            {alerts.map((alert, i) => {
              const isCrit = alert.level === 'critical'
              const trend = alert.campaign.ctrTrend
              const maxVal = Math.max(...trend)

              return (
                <div key={i} className={`rounded-xl p-4 border ${isCrit ? 'bg-red-500/5 border-red-500/40' : 'bg-amber-500/5 border-amber-500/30'}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCrit ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {isCrit ? '🔥 Fatiga crítica' : '⚠️ Fatiga leve'}
                        </span>
                      </div>
                      <p className="text-white font-semibold text-sm">{alert.campaign.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">Frecuencia</p>
                      <p className={`text-lg font-bold ${alert.campaign.frequency >= 5 ? 'text-red-400' : 'text-amber-400'}`}>
                        {alert.campaign.frequency.toFixed(1)}x
                      </p>
                    </div>
                  </div>

                  {/* CTR trend minibar */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5">CTR últimos 7 días</p>
                    <div className="flex items-end gap-1 h-8">
                      {trend.map((val, j) => {
                        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0
                        const isLast = j === trend.length - 1
                        return (
                          <div key={j} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                            <div
                              className={`w-full rounded-sm transition-all ${isLast ? (isCrit ? 'bg-red-500' : 'bg-amber-500') : 'bg-white/10'}`}
                              style={{ height: `${Math.max(10, pct)}%` }}
                            />
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-600">{trend[0].toFixed(1)}%</span>
                      <span className={`text-xs font-medium ${isCrit ? 'text-red-400' : 'text-amber-400'}`}>{trend[trend.length - 1].toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {alert.reasons.map((r, j) => (
                      <span key={j} className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">{r}</span>
                    ))}
                  </div>

                  <p className="text-xs text-blue-400">
                    <span className="font-medium">✦ Acción: </span>{alert.action}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
