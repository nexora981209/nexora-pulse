import { useState } from 'react'
import type { MetricValues, Campaign } from '../data/mockData'
import { calculateHealthScore, generateDiagnosis, getMetricStatus } from '../utils/scoring'
import { generateRecommendations } from '../utils/recommendations'
import { METRICS } from '../data/mockData'
import { generatePDF } from '../utils/pdfExport'

interface Props {
  metrics: MetricValues
  campaigns: Campaign[]
  isRealData: boolean
  onUploadCSV: () => void
  onAdvancedView: () => void
  onDownloaded: () => void
}

const simpleLabels: Record<string, { label: string; tooltip: string }> = {
  ctr_all:    { label: 'Clics en tus anuncios', tooltip: 'De cada 100 personas que ven tu anuncio, cuántas hacen clic. Ideal: entre 2 y 3 de cada 100.' },
  ctr_unique: { label: 'Personas únicas que hacen clic', tooltip: 'Similar al anterior pero contando cada persona solo una vez, aunque vea el anuncio varias veces.' },
  roas:       { label: 'Retorno por cada $1 invertido', tooltip: 'Si gastas $1 en publicidad y vendes $3, tu ROAS es 3x. Lo ideal es ganar al menos $3 por cada $1.' },
  frequency:  { label: 'Veces que ven tu anuncio', tooltip: 'Cuántas veces ve una persona tu anuncio en promedio. Si lo ve más de 3 veces, empieza a ignorarlo.' },
  cpc:        { label: 'Costo por cada clic', tooltip: 'Cuánto te cuesta cada vez que alguien hace clic en tu anuncio. Ideal: menos de $0.50.' },
  cpa:        { label: 'Costo por conseguir un cliente', tooltip: 'Cuánto gastas en publicidad para lograr una venta o conversión. Debe ser menor que tu ganancia por venta.' },
  conv_rate:  { label: 'De cada 100 clics, cuántos compran', tooltip: 'Si 100 personas visitan tu página y 5 compran, tu tasa es 5%. Lo ideal es 5% o más.' },
  engagement: { label: 'Interacción con tus anuncios', tooltip: 'Likes, comentarios y compartidos en relación al alcance. Entre 1% y 2% es saludable.' },
  relevance:  { label: 'Qué tan relevante es tu anuncio', tooltip: 'Puntuación que Meta le da a tu anuncio del 1 al 10. Si es baja, Meta te cobra más por mostrarlo.' },
}

const simpleAlerts: Record<string, { warning: string; critical: string }> = {
  ctr_all:    { warning: 'Tu anuncio no está llamando suficiente la atención.', critical: 'Muy poca gente hace clic. El anuncio necesita cambiar urgente.' },
  ctr_unique: { warning: 'Pocas personas nuevas están haciendo clic.', critical: 'Casi nadie hace clic. El anuncio no está funcionando.' },
  roas:       { warning: 'Estás ganando, pero el margen es bajo.', critical: 'Estás perdiendo dinero en publicidad. Hay que actuar ya.' },
  frequency:  { warning: 'Las personas ven tu anuncio demasiadas veces y lo ignoran.', critical: 'Tu audiencia está saturada. Están ignorando o ocultando el anuncio.' },
  cpc:        { warning: 'Cada clic te está costando más de lo ideal.', critical: 'El costo por clic es muy alto. Estás pagando de más.' },
  cpa:        { warning: 'Conseguir un cliente cuesta más de lo deseable.', critical: 'Cada venta te cuesta demasiado. La campaña no es rentable.' },
  conv_rate:  { warning: 'Pocas personas que hacen clic terminan comprando.', critical: 'Casi nadie compra después de visitar tu página.' },
  engagement: { warning: 'Poca interacción con tus anuncios.', critical: 'Tu contenido no genera ninguna reacción.' },
  relevance:  { warning: 'Meta considera que tu anuncio no es muy relevante.', critical: 'Meta está limitando tu alcance y cobrándote más.' },
}

const simpleActions: Record<string, string> = {
  ctr_all:    'Cambia la imagen o el texto del anuncio por algo más llamativo o con una oferta clara',
  ctr_unique: 'Amplía la audiencia para llegar a personas nuevas que no han visto tu marca',
  roas:       'Sube el precio promedio de venta con combos o productos adicionales',
  frequency:  'Crea anuncios nuevos para que la gente no vea siempre lo mismo',
  cpc:        'Mejora la calidad del anuncio — Meta cobra menos cuando el anuncio conecta bien con la audiencia',
  cpa:        'Enfócate en las campañas que traen clientes a menor costo y pausa las demás',
  conv_rate:  'Mejora tu página de destino: que cargue rápido, sea clara y tenga un botón de compra visible',
  engagement: 'Publica contenido más cercano: testimonios reales, videos cortos, preguntas directas',
  relevance:  'Usa testimonios reales de clientes — Meta premia el contenido auténtico',
}

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(v => !v)}
        className="w-4 h-4 rounded-full bg-white/10 text-gray-500 text-xs flex items-center justify-center hover:bg-white/20 hover:text-gray-300 transition-colors flex-shrink-0"
      >?</button>
      {show && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-56 bg-[#2a2b35] border border-white/10 rounded-xl p-3 text-xs text-gray-300 leading-relaxed z-50 shadow-2xl">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#2a2b35]" />
        </div>
      )}
    </div>
  )
}

export default function ClientView({ metrics, campaigns, isRealData, onUploadCSV, onAdvancedView, onDownloaded }: Props) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const score = calculateHealthScore(metrics)
  const diagnoses = generateDiagnosis(metrics)
  const recommendations = generateRecommendations(metrics)

  const scoreColor = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
  const scoreLabel = score >= 70 ? '¡Tus anuncios van bien!' : score >= 45 ? 'Hay cosas que mejorar' : 'Necesita atención urgente'
  const scoreDesc = score >= 70
    ? 'Tu publicidad está funcionando correctamente. Sigue así y considera invertir más en lo que da resultados.'
    : score >= 45
    ? 'Tu publicidad funciona, pero hay áreas donde estás dejando dinero sobre la mesa.'
    : 'Tu publicidad tiene problemas serios. Cada día sin correcciones representa dinero perdido.'

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  async function handlePDF() {
    setPdfLoading(true)
    await generatePDF(metrics, campaigns, isRealData)
    setPdfLoading(false)
    onDownloaded()
  }

  return (
    <div className="min-h-screen bg-[#0a0a10]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a10]/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">N</div>
            <p className="text-white font-bold text-sm">Nexora Pulse</p>
          </div>
          <div className="flex items-center gap-2">
            {!isRealData && (
              <button onClick={onUploadCSV}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-full font-medium transition-colors">
                📥 Subir mis datos
              </button>
            )}
            <button onClick={handlePDF} disabled={pdfLoading}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-60">
              {pdfLoading ? '⏳' : '📄 Descargar PDF'}
            </button>
            <button onClick={onAdvancedView}
              className="text-xs text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors">
              Vista avanzada ↗
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">

        {/* Demo banner */}
        {!isRealData && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xl flex-shrink-0">🧪</span>
            <div className="flex-1 min-w-0">
              <p className="text-amber-400 font-semibold text-sm">Estás viendo datos de ejemplo</p>
              <p className="text-amber-400/70 text-xs mt-0.5">Sube tu CSV de Meta Ads para ver tu análisis real</p>
            </div>
            <button onClick={onUploadCSV}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-black font-bold px-3 py-1.5 rounded-full transition-colors flex-shrink-0">
              Subir datos
            </button>
          </div>
        )}

        {/* Score hero */}
        <div className="bg-[#1a1b25] rounded-2xl p-6 border border-white/5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-medium">Salud de tu Publicidad</p>
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="60" cy="60" r="54" fill="none" stroke={scoreColor} strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{score}</span>
                <span className="text-sm text-gray-400">/100</span>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {score >= 70 ? '🎉' : score >= 45 ? '⚠️' : '🚨'} {scoreLabel}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">{scoreDesc}</p>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Óptimas', value: diagnoses.filter(d => d.status === 'optimal').length + (9 - diagnoses.length), color: 'text-emerald-400' },
              { label: 'Con alerta', value: diagnoses.filter(d => d.status === 'warning').length, color: 'text-amber-400' },
              { label: 'Críticas', value: diagnoses.filter(d => d.status === 'critical').length, color: 'text-red-400' },
            ].map((s, i) => (
              <div key={i} className="bg-[#13141e] rounded-xl py-3">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            ¿Cómo están tus números?
            <span className="text-xs text-gray-600 font-normal">Pasa el cursor sobre ? para ver qué significa cada uno</span>
          </h3>
          <div className="space-y-2">
            {METRICS.map((m) => {
              const value = metrics[m.key as keyof MetricValues]
              const status = getMetricStatus(m.key, value)
              const info = simpleLabels[m.key]
              const dot = status === 'optimal' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
              const statusText = status === 'optimal' ? '✓ Bien' : status === 'warning' ? '⚠ Atención' : '✗ Problema'
              const statusColor = status === 'optimal' ? 'text-emerald-400' : status === 'warning' ? 'text-amber-400' : 'text-red-400'
              return (
                <div key={m.key} className="bg-[#1a1b25] rounded-xl px-4 py-3 border border-white/5 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <p className="text-gray-300 text-sm truncate">{info.label}</p>
                    <Tooltip text={info.tooltip} />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">{m.format(value)}</p>
                    <p className={`text-xs ${statusColor}`}>{statusText}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alerts */}
        {diagnoses.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3">¿Qué está fallando?</h3>
            <div className="space-y-3">
              {diagnoses.map((d, i) => {
                const metricKey = METRICS.find(m => m.label === d.metric)?.key ?? ''
                const alerts = simpleAlerts[metricKey]
                const action = simpleActions[metricKey]
                const isCritical = d.status === 'critical'
                return (
                  <div key={i} className={`rounded-xl p-4 border ${isCritical ? 'bg-red-500/5 border-red-500/30' : 'bg-amber-500/5 border-amber-500/30'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span>{isCritical ? '🚨' : '⚠️'}</span>
                      <span className={`font-semibold text-sm ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>{d.metric}</span>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {isCritical ? 'Urgente' : 'Revisar'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      {alerts?.[d.status === 'critical' ? 'critical' : 'warning'] ?? d.cause}
                    </p>
                    {action && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                        <p className="text-xs text-blue-400">
                          <span className="font-semibold">¿Qué hacer?</span> {action}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action plan */}
        <div>
          <h3 className="text-white font-semibold mb-1">Tu plan de acción</h3>
          <p className="text-gray-500 text-xs mb-3">Empieza por el número 1 — es lo más importante</p>
          <div className="space-y-2">
            {recommendations.slice(0, 5).map((r, i) => (
              <div key={i} className="bg-[#1a1b25] rounded-xl p-4 border border-white/5 flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                  i === 0 ? 'bg-red-500 text-white' : i === 1 ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400'
                }`}>{i + 1}</div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{r.action}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Impacto esperado: <span className="text-emerald-400 font-medium">{r.estimatedGain}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaigns */}
        <div>
          <h3 className="text-white font-semibold mb-3">Tus campañas</h3>
          <div className="space-y-2">
            {campaigns.map((c, i) => {
              const dot = c.health === 'optimal' ? 'bg-emerald-500' : c.health === 'warning' ? 'bg-amber-500' : 'bg-red-500'
              const msg = c.health === 'optimal' ? 'Funcionando bien' : c.health === 'warning' ? 'Puede mejorar' : 'Necesita atención'
              const msgColor = c.health === 'optimal' ? 'text-emerald-400' : c.health === 'warning' ? 'text-amber-400' : 'text-red-400'
              return (
                <div key={i} className="bg-[#1a1b25] rounded-xl px-4 py-3 border border-white/5 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`}
                    style={{ boxShadow: `0 0 6px ${c.health === 'optimal' ? '#10b981' : c.health === 'warning' ? '#f59e0b' : '#ef4444'}` }} />
                  <p className="text-gray-300 text-sm flex-1 min-w-0 truncate">{c.name}</p>
                  <div className="text-right flex-shrink-0">
                    {c.roas > 0 && <p className="text-white text-sm font-bold">{c.roas.toFixed(1)}x</p>}
                    <p className={`text-xs ${msgColor}`}>{msg}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Download CTA */}
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-6 text-center">
          <p className="text-white font-bold text-base mb-1">¿Quieres compartir este reporte?</p>
          <p className="text-gray-400 text-sm mb-4">Descárgalo en PDF con todas las métricas y recomendaciones</p>
          <button onClick={handlePDF} disabled={pdfLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-60">
            {pdfLoading ? '⏳ Generando...' : '📄 Descargar reporte PDF'}
          </button>
        </div>

        <div className="text-center py-2 text-xs text-gray-600">
          Nexora Pulse · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
