'use client'
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

const metricLabels: Record<string, { label: string; tooltip: string }> = {
  ctr_all:    { label: 'Clics en anuncios',       tooltip: 'De cada 100 personas que ven tu anuncio, cuántas hacen clic. Ideal: entre 2% y 3%.' },
  ctr_unique: { label: 'Clics únicos',             tooltip: 'Personas distintas que hacen clic, sin repetidos. Ideal: más de 1%.' },
  roas:       { label: 'Retorno por cada $1',      tooltip: 'Si gastas $1 y vendes $3, tu ROAS es 3x. Mínimo recomendado: 3x.' },
  frequency:  { label: 'Frecuencia de exposición', tooltip: 'Veces que una persona ve tu anuncio. Más de 3 veces empieza a ignorarlo.' },
  cpc:        { label: 'Costo por clic',           tooltip: 'Cuánto pagas cada vez que alguien hace clic. Ideal: menos de $0.50.' },
  cpa:        { label: 'Costo por conversión',     tooltip: 'Cuánto cuesta conseguir una venta o lead.' },
  conv_rate:  { label: 'Tasa de conversión',       tooltip: 'De cada 100 clics, cuántos terminan comprando. Ideal: 5% o más.' },
  engagement: { label: 'Engagement',               tooltip: 'Interacciones con tus anuncios (likes, comentarios, compartidos).' },
  relevance:  { label: 'Relevancia Meta',          tooltip: 'Puntuación de Meta del 1 al 10. Baja relevancia = mayor costo.' },
}

const alertMessages: Record<string, { warning: string; critical: string; action: string }> = {
  ctr_all:    { warning: 'El anuncio no está captando suficiente atención.',   critical: 'Muy pocos clics. El creative necesita cambiar.',          action: 'Cambia la imagen o el titular del anuncio por algo con una oferta más directa.' },
  ctr_unique: { warning: 'Pocas personas nuevas están haciendo clic.',        critical: 'Casi nadie hace clic. El anuncio no está funcionando.',    action: 'Amplía la audiencia para llegar a personas nuevas.' },
  roas:       { warning: 'El margen de retorno es bajo.',                     critical: 'Estás perdiendo dinero en publicidad.',                    action: 'Sube el ticket promedio con combos o upsells antes de escalar.' },
  frequency:  { warning: 'Tu audiencia ve el anuncio demasiadas veces.',      critical: 'Audiencia saturada — están ignorando el anuncio.',         action: 'Crea creativos nuevos para refrescar lo que la audiencia ve.' },
  cpc:        { warning: 'Cada clic te cuesta más de lo ideal.',              critical: 'El costo por clic es muy alto.',                           action: 'Mejora la calidad del anuncio — Meta cobra menos cuando conecta mejor.' },
  cpa:        { warning: 'Conseguir un cliente cuesta más de lo deseable.',   critical: 'Cada venta te cuesta demasiado. La campaña no es rentable.', action: 'Pausa las campañas de mayor costo y escala las más eficientes.' },
  conv_rate:  { warning: 'Pocas personas que hacen clic terminan comprando.', critical: 'Casi nadie compra después de visitar tu página.',          action: 'Mejora tu landing page: carga rápida, mensaje claro, botón visible.' },
  engagement: { warning: 'Poca interacción con tus anuncios.',               critical: 'El contenido no genera ninguna reacción.',                 action: 'Usa testimonios reales, videos cortos o preguntas directas.' },
  relevance:  { warning: 'Meta considera tu anuncio poco relevante.',        critical: 'Meta está limitando tu alcance y cobrando más.',           action: 'El contenido auténtico recibe mejor puntuación de Meta.' },
}

function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(v => !v)}
        className="w-3.5 h-3.5 rounded-full border border-white/15 text-white/25 text-[9px] flex items-center justify-center hover:border-white/30 hover:text-white/40 transition-colors leading-none"
        style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
      >i</button>
      {show && (
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 w-56 bg-[#1c1c1e] border border-white/8 rounded-2xl p-3 text-[11px] text-white/60 leading-relaxed z-50 shadow-2xl pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#1c1c1e]" />
        </span>
      )}
    </span>
  )
}

export default function ClientView({ metrics, campaigns, isRealData, onUploadCSV, onAdvancedView, onDownloaded }: Props) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const score = calculateHealthScore(metrics)
  const diagnoses = generateDiagnosis(metrics)
  const recommendations = generateRecommendations(metrics)

  const scoreColor  = score >= 70 ? '#30d158' : score >= 45 ? '#ff9f0a' : '#ff453a'
  const scoreLabel  = score >= 70 ? 'Rendimiento óptimo' : score >= 45 ? 'Necesita atención' : 'Acción urgente'
  const scoreDetail = score >= 70
    ? 'Tus campañas funcionan bien. Considera escalar presupuesto en lo que da resultados.'
    : score >= 45
    ? 'Hay oportunidades de mejora que cuestan dinero cada día que no se atienden.'
    : 'Hay problemas activos que están consumiendo presupuesto sin retorno.'

  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference - (score / 100) * circumference

  const critical = diagnoses.filter(d => d.status === 'critical')
  const warnings  = diagnoses.filter(d => d.status === 'warning')

  async function handlePDF() {
    setPdfLoading(true)
    await generatePDF(metrics, campaigns, isRealData)
    setPdfLoading(false)
    onDownloaded()
  }

  // Empty state
  if (isRealData && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
        <nav className="px-6 py-5 flex items-center justify-between border-b border-white/[0.05]">
          <span className="text-white font-semibold text-[15px] tracking-tight">Metrixa</span>
          <button onClick={onAdvancedView} className="text-white/30 text-[13px] hover:text-white/60 transition-colors">Avanzado</button>
        </nav>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-xs w-full text-center space-y-5">
            <p className="text-white text-[22px] font-semibold tracking-tight">Cuenta conectada</p>
            <p className="text-white/40 text-[15px] leading-relaxed">No hay campañas activas en los últimos 30 días en tu cuenta de Meta Ads.</p>
            <button onClick={onUploadCSV} className="w-full bg-white text-black text-[15px] font-semibold py-3 rounded-2xl hover:bg-white/90 transition-colors mt-4">
              Subir datos CSV
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-black/80 backdrop-blur-2xl border-b border-white/[0.05] px-5 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <span className="text-white font-semibold text-[15px] tracking-tight">Metrixa</span>
          <div className="flex items-center gap-3">
            {!isRealData && (
              <button onClick={onUploadCSV}
                className="bg-white text-black text-[13px] font-semibold px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors">
                Subir datos
              </button>
            )}
            <button onClick={handlePDF} disabled={pdfLoading}
              className="text-white/40 text-[13px] hover:text-white/70 transition-colors disabled:opacity-30">
              {pdfLoading ? 'PDF...' : 'PDF'}
            </button>
            <button onClick={onAdvancedView}
              className="text-white/30 text-[13px] hover:text-white/60 transition-colors">
              Avanzado
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-5 pb-16">

        {/* Demo notice — ultra minimal */}
        {!isRealData && (
          <div className="mt-5 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.05]">
            <p className="text-white/40 text-[13px]">Datos de demostración</p>
            <button onClick={onUploadCSV} className="text-white/60 text-[13px] hover:text-white transition-colors font-medium">
              Conectar →
            </button>
          </div>
        )}

        {/* Score — hero section */}
        <div className="mt-10 mb-10 flex flex-col items-center text-center space-y-5">
          {/* Ring */}
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={scoreColor} strokeWidth="7"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 10px ${scoreColor}50)` }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[44px] font-bold text-white leading-none tracking-tighter">{score}</span>
              <span className="text-[13px] text-white/30 font-medium mt-1">de 100</span>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-[22px] font-semibold tracking-tight" style={{ color: scoreColor }}>{scoreLabel}</p>
            <p className="text-[15px] text-white/40 mt-2 leading-relaxed max-w-[280px] mx-auto">{scoreDetail}</p>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-6 pt-1">
            <div className="text-center">
              <p className="text-[28px] font-bold text-[#30d158] leading-none">{9 - critical.length - warnings.length}</p>
              <p className="text-[12px] text-white/25 mt-1.5 font-medium uppercase tracking-wider">Óptimas</p>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="text-center">
              <p className="text-[28px] font-bold text-[#ff9f0a] leading-none">{warnings.length}</p>
              <p className="text-[12px] text-white/25 mt-1.5 font-medium uppercase tracking-wider">Alertas</p>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="text-center">
              <p className="text-[28px] font-bold text-[#ff453a] leading-none">{critical.length}</p>
              <p className="text-[12px] text-white/25 mt-1.5 font-medium uppercase tracking-wider">Críticas</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06] mb-8" />

        {/* Metrics */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[17px] font-semibold tracking-tight">Métricas</p>
            <p className="text-[13px] text-white/25">Últimos 30 días</p>
          </div>
          <div className="space-y-0 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.05]">
            {METRICS.map((m, idx) => {
              const value = metrics[m.key as keyof MetricValues]
              const status = getMetricStatus(m.key, value)
              const info = metricLabels[m.key]
              const dotColor = status === 'optimal' ? '#30d158' : status === 'warning' ? '#ff9f0a' : '#ff453a'
              const isLast = idx === METRICS.length - 1
              return (
                <div key={m.key}
                  className={`flex items-center gap-3 px-4 py-3.5 ${!isLast ? 'border-b border-white/[0.04]' : ''}`}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-[15px] text-white/60 truncate">{info.label}</span>
                    <InfoTip text={info.tooltip} />
                  </div>
                  <span className="text-[15px] font-semibold tabular-nums text-white">{m.format(value)}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Alerts */}
        {diagnoses.length > 0 && (
          <section className="mb-10">
            <p className="text-[17px] font-semibold tracking-tight mb-4">Alertas</p>
            <div className="space-y-2">
              {diagnoses.map((d, i) => {
                const mKey = METRICS.find(m => m.label === d.metric)?.key ?? ''
                const info = alertMessages[mKey]
                const isCrit = d.status === 'critical'
                const accentColor = isCrit ? '#ff453a' : '#ff9f0a'
                return (
                  <div key={i} className="rounded-2xl border border-white/[0.05] bg-white/[0.03] overflow-hidden">
                    <div className="flex items-start gap-3 p-4">
                      <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5" style={{ background: accentColor, minHeight: '16px' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-[13px] font-semibold" style={{ color: accentColor }}>{d.metric}</p>
                          <span className="text-[11px] font-semibold text-white/25 uppercase tracking-wider">
                            {isCrit ? 'Urgente' : 'Revisar'}
                          </span>
                        </div>
                        <p className="text-[14px] text-white/50 leading-relaxed">
                          {info?.[isCrit ? 'critical' : 'warning'] ?? d.cause}
                        </p>
                        {info?.action && (
                          <p className="text-[13px] text-white/30 mt-2 leading-relaxed">
                            <span className="text-white/50 font-medium">Acción — </span>{info.action}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Action plan */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[17px] font-semibold tracking-tight">Plan de acción</p>
            <p className="text-[13px] text-white/25">Por prioridad</p>
          </div>
          <div className="space-y-2">
            {recommendations.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-[13px] font-bold text-white/20 w-4 flex-shrink-0 mt-0.5 tabular-nums">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-white/80 leading-snug">{r.action}</p>
                  {r.estimatedGain && (
                    <p className="text-[13px] text-[#30d158]/60 mt-1">{r.estimatedGain}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Campaigns */}
        {campaigns.length > 0 && (
          <section className="mb-10">
            <p className="text-[17px] font-semibold tracking-tight mb-4">Campañas</p>
            <div className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.05] divide-y divide-white/[0.04]">
              {campaigns.map((c, i) => {
                const dotColor = c.health === 'optimal' ? '#30d158' : c.health === 'warning' ? '#ff9f0a' : '#ff453a'
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                    <p className="text-[15px] text-white/60 flex-1 min-w-0 truncate">{c.name}</p>
                    {c.roas > 0 && (
                      <p className="text-[15px] font-semibold text-white tabular-nums">{c.roas.toFixed(1)}x</p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* PDF export */}
        <div className="h-px bg-white/[0.06] mb-8" />
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-[17px] font-semibold tracking-tight">Exportar reporte</p>
            <p className="text-[13px] text-white/30 mt-0.5">PDF con métricas y recomendaciones</p>
          </div>
          <button onClick={handlePDF} disabled={pdfLoading}
            className="bg-white text-black text-[14px] font-semibold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors disabled:opacity-40 flex-shrink-0">
            {pdfLoading ? 'Generando...' : 'Descargar'}
          </button>
        </div>

        <p className="text-center text-[12px] text-white/15 mt-8">Metrixa · {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
