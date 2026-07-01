import type { MetricValues, Campaign } from '../data/mockData'
import { calculateHealthScore, generateDiagnosis, getMetricStatus } from '../utils/scoring'
import { generateRecommendations } from '../utils/recommendations'
import { METRICS } from '../data/mockData'

interface Props {
  metrics: MetricValues
  campaigns: Campaign[]
  onClose: () => void
}

const simpleLabels: Record<string, string> = {
  ctr_all:    'Gente que hace clic en tus anuncios',
  ctr_unique: 'Personas únicas que hacen clic',
  roas:       'Retorno por cada dólar invertido',
  frequency:  'Veces que ven tu anuncio',
  cpc:        'Costo por cada clic',
  cpa:        'Costo por conseguir un cliente',
  conv_rate:  'De cada 100 clics, cuántos compran',
  engagement: 'Interacción con tus publicaciones',
  relevance:  'Qué tan relevante es tu anuncio para Meta',
}

const simpleAlerts: Record<string, { warning: string; critical: string }> = {
  ctr_all:    { warning: 'Tu anuncio no está llamando suficiente la atención.', critical: 'Muy poca gente hace clic en tu anuncio. El creativo necesita cambiar.' },
  ctr_unique: { warning: 'Pocas personas nuevas están haciendo clic.', critical: 'Casi nadie hace clic. El anuncio no está funcionando.' },
  roas:       { warning: 'Estás ganando, pero el margen es bajo.', critical: 'Estás perdiendo dinero en publicidad. Hay que actuar ya.' },
  frequency:  { warning: 'Las personas ven tu anuncio demasiadas veces.', critical: 'Tu audiencia está saturada. Están ignorando o ocultando el anuncio.' },
  cpc:        { warning: 'Cada clic te está costando más de lo ideal.', critical: 'El costo por clic es muy alto. Estás pagando de más.' },
  cpa:        { warning: 'Conseguir un cliente cuesta más de lo deseable.', critical: 'Cada venta te cuesta demasiado. La campaña no es rentable.' },
  conv_rate:  { warning: 'Pocas personas que hacen clic terminan comprando.', critical: 'Casi nadie que visita tu web termina comprando. El proceso tiene fallas.' },
  engagement: { warning: 'Poca interacción con tus publicaciones.', critical: 'Tu contenido no genera ninguna reacción en la audiencia.' },
  relevance:  { warning: 'Meta considera que tu anuncio no es muy relevante.', critical: 'Meta está limitando tu alcance porque el anuncio no conecta con la audiencia.' },
}

const simpleActions: Record<string, string> = {
  ctr_all:    'Cambiar la imagen o el texto del anuncio por algo más llamativo',
  ctr_unique: 'Ampliar la audiencia para llegar a personas nuevas',
  roas:       'Aumentar el precio promedio de venta o reducir los costos de la campaña',
  frequency:  'Crear anuncios nuevos para que la gente no vea siempre lo mismo',
  cpc:        'Mejorar la calidad del anuncio para que Meta lo muestre a menor costo',
  cpa:        'Enfocarse en las campañas que traen clientes a menor costo',
  conv_rate:  'Mejorar la página de destino para que sea más fácil y clara comprar',
  engagement: 'Publicar contenido más cercano, auténtico o con preguntas directas',
  relevance:  'Crear anuncios con testimonios reales de clientes satisfechos',
}

export default function ClientView({ metrics, campaigns, onClose }: Props) {
  const score = calculateHealthScore(metrics)
  const diagnoses = generateDiagnosis(metrics)
  const recommendations = generateRecommendations(metrics)

  const scoreColor = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
  const scoreLabel = score >= 70 ? '¡Tus anuncios van bien! 🎉' : score >= 45 ? 'Hay cosas que mejorar ⚠️' : 'Necesita atención urgente 🚨'
  const scoreDesc = score >= 70
    ? 'Tu publicidad está funcionando correctamente. Sigue así y considera invertir más en lo que está dando resultados.'
    : score >= 45
    ? 'Tu publicidad está funcionando, pero hay áreas donde estás dejando dinero sobre la mesa. Mira las recomendaciones abajo.'
    : 'Tu publicidad está teniendo problemas serios. Cada día que pasa sin correcciones representa dinero perdido.'

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="fixed inset-0 bg-[#0a0a10] z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#0a0a10]/95 backdrop-blur border-b border-white/5 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">N</div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Reporte de Publicidad</p>
              <p className="text-gray-500 text-xs mt-0.5">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors"
          >
            ← Volver al dashboard
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">

        {/* Score hero */}
        <div className="bg-[#1a1b25] rounded-2xl p-6 border border-white/5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-medium">Salud General de tu Publicidad</p>
          <div className="flex justify-center mb-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="60" cy="60" r="54" fill="none" stroke={scoreColor} strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{score}</span>
                <span className="text-sm text-gray-400">/100</span>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{scoreLabel}</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">{scoreDesc}</p>
        </div>

        {/* KPI cards in plain language */}
        <div>
          <h3 className="text-white font-semibold mb-3">¿Cómo están tus números?</h3>
          <div className="grid grid-cols-1 gap-2">
            {METRICS.map((m) => {
              const value = metrics[m.key as keyof MetricValues]
              const status = getMetricStatus(m.key, value)
              const dot = status === 'optimal' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
              const label = status === 'optimal' ? '✓ Bien' : status === 'warning' ? '⚠ Atención' : '✗ Problema'
              const labelColor = status === 'optimal' ? 'text-emerald-400' : status === 'warning' ? 'text-amber-400' : 'text-red-400'

              return (
                <div key={m.key} className="bg-[#1a1b25] rounded-xl px-4 py-3 border border-white/5 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-sm">{simpleLabels[m.key]}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">{m.format(value)}</p>
                    <p className={`text-xs ${labelColor}`}>{label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alerts in plain language */}
        {diagnoses.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3">¿Qué está fallando?</h3>
            <div className="space-y-3">
              {diagnoses.map((d, i) => {
                const alerts = simpleAlerts[METRICS.find(m => m.label === d.metric)?.key ?? '']
                const action = simpleActions[METRICS.find(m => m.label === d.metric)?.key ?? '']
                const isCritical = d.status === 'critical'
                return (
                  <div key={i} className={`rounded-xl p-4 border ${isCritical ? 'bg-red-500/5 border-red-500/30' : 'bg-amber-500/5 border-amber-500/30'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span>{isCritical ? '🚨' : '⚠️'}</span>
                      <span className={`font-semibold text-sm ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                        {d.metric}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      {alerts?.[d.status === 'critical' ? 'critical' : 'warning'] ?? d.cause}
                    </p>
                    {action && (
                      <p className="text-xs text-blue-400">
                        <span className="font-medium">¿Qué hacer?</span> {action}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recommendations as checklist */}
        <div>
          <h3 className="text-white font-semibold mb-1">Plan de acción</h3>
          <p className="text-gray-500 text-xs mb-3">Haz estas cosas en orden — la primera es la más importante</p>
          <div className="space-y-2">
            {recommendations.slice(0, 5).map((r, i) => (
              <div key={i} className="bg-[#1a1b25] rounded-xl p-4 border border-white/5 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-500 flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{r.action}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Resultado esperado: <span className="text-emerald-400">{r.estimatedGain}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaigns simplified */}
        <div>
          <h3 className="text-white font-semibold mb-3">Tus campañas de un vistazo</h3>
          <div className="space-y-2">
            {campaigns.map((c, i) => {
              const dot = c.health === 'optimal' ? 'bg-emerald-500' : c.health === 'warning' ? 'bg-amber-500' : 'bg-red-500'
              const msg = c.health === 'optimal' ? 'Funcionando bien' : c.health === 'warning' ? 'Puede mejorar' : 'Necesita atención'
              const msgColor = c.health === 'optimal' ? 'text-emerald-400' : c.health === 'warning' ? 'text-amber-400' : 'text-red-400'
              return (
                <div key={i} className="bg-[#1a1b25] rounded-xl px-4 py-3 border border-white/5 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} style={{ boxShadow: `0 0 6px ${c.health === 'optimal' ? '#10b981' : c.health === 'warning' ? '#f59e0b' : '#ef4444'}` }} />
                  <p className="text-gray-300 text-sm flex-1 min-w-0 truncate">{c.name}</p>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-bold">{c.roas.toFixed(1)}x</p>
                    <p className={`text-xs ${msgColor}`}>{msg}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-center py-4 text-xs text-gray-600">
          Reporte generado por Nexora Pulse · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
