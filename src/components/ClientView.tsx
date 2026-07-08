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

const simpleLabels: Record<string, { label: string; tooltip: string }> = {
  ctr_all:    { label: 'Clics en anuncios', tooltip: 'De cada 100 personas que ven tu anuncio, cuántas hacen clic. Ideal: entre 2% y 3%.' },
  ctr_unique: { label: 'Clics únicos', tooltip: 'Personas únicas que hacen clic, sin contar repetidos. Ideal: más de 1%.' },
  roas:       { label: 'Retorno por cada $1', tooltip: 'Si gastas $1 en publicidad y vendes $3, tu ROAS es 3x. Ideal: mínimo 3x.' },
  frequency:  { label: 'Frecuencia de exposición', tooltip: 'Veces que una persona ve tu anuncio. Más de 3 veces empieza a ignorarlo.' },
  cpc:        { label: 'Costo por clic', tooltip: 'Cuánto pagas cada vez que alguien hace clic. Ideal: menos de $0.50.' },
  cpa:        { label: 'Costo por conversión', tooltip: 'Cuánto cuesta conseguir una venta o lead. Debe ser menor que tu ganancia por cliente.' },
  conv_rate:  { label: 'Tasa de conversión', tooltip: 'De cada 100 clics, cuántos terminan comprando. Ideal: 5% o más.' },
  engagement: { label: 'Engagement', tooltip: 'Likes, comentarios y compartidos. Entre 1% y 2% es saludable.' },
  relevance:  { label: 'Relevancia Meta', tooltip: 'Puntuación de Meta del 1 al 10. Baja relevancia = mayor costo.' },
}

const simpleAlerts: Record<string, { warning: string; critical: string }> = {
  ctr_all:    { warning: 'Tu anuncio no está llamando suficiente la atención.', critical: 'Muy poca gente hace clic. El anuncio necesita cambiar urgente.' },
  ctr_unique: { warning: 'Pocas personas nuevas están haciendo clic.', critical: 'Casi nadie hace clic. El anuncio no está funcionando.' },
  roas:       { warning: 'Estás ganando, pero el margen es bajo.', critical: 'Estás perdiendo dinero en publicidad. Hay que actuar ya.' },
  frequency:  { warning: 'Las personas ven tu anuncio demasiadas veces.', critical: 'Tu audiencia está saturada. Están ignorando el anuncio.' },
  cpc:        { warning: 'Cada clic te está costando más de lo ideal.', critical: 'El costo por clic es muy alto. Estás pagando de más.' },
  cpa:        { warning: 'Conseguir un cliente cuesta más de lo deseable.', critical: 'Cada venta te cuesta demasiado. La campaña no es rentable.' },
  conv_rate:  { warning: 'Pocas personas que hacen clic terminan comprando.', critical: 'Casi nadie compra después de visitar tu página.' },
  engagement: { warning: 'Poca interacción con tus anuncios.', critical: 'Tu contenido no genera ninguna reacción.' },
  relevance:  { warning: 'Meta considera que tu anuncio no es muy relevante.', critical: 'Meta está limitando tu alcance y cobrándote más.' },
}

const simpleActions: Record<string, string> = {
  ctr_all:    'Cambia la imagen o el texto del anuncio por algo más llamativo o con una oferta clara',
  ctr_unique: 'Amplía la audiencia para llegar a personas nuevas',
  roas:       'Sube el ticket promedio con combos o upsells',
  frequency:  'Crea creativos nuevos para que la audiencia no vea siempre lo mismo',
  cpc:        'Mejora la calidad del anuncio — Meta cobra menos cuando el contenido conecta bien',
  cpa:        'Pausa las campañas de mayor costo y escala las que traen clientes más baratos',
  conv_rate:  'Mejora tu landing page: carga rápido, mensaje claro, botón visible',
  engagement: 'Usa testimonios reales, videos cortos o preguntas directas',
  relevance:  'El contenido auténtico recibe mejor puntuación de Meta',
}

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(v => !v)}
        className="w-3.5 h-3.5 rounded-full border border-white/20 text-white/30 text-[9px] flex items-center justify-center hover:border-white/40 hover:text-white/50 transition-colors"
      >i</button>
      {show && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-52 bg-[#1e1f2e] border border-white/10 rounded-xl p-3 text-xs text-slate-300 leading-relaxed z-50 shadow-2xl">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e1f2e]" />
        </div>
      )}
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect width="22" height="22" rx="6" fill="#6366f1"/>
        <path d="M5 16L8.5 7L11 13L13.5 9L17 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-white font-semibold text-sm tracking-tight">Metrixa</span>
    </div>
  )
}

export default function ClientView({ metrics, campaigns, isRealData, onUploadCSV, onAdvancedView, onDownloaded }: Props) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const score = calculateHealthScore(metrics)
  const diagnoses = generateDiagnosis(metrics)
  const recommendations = generateRecommendations(metrics)

  const scoreColor = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
  const scoreGlow = score >= 70 ? 'rgba(16,185,129,0.15)' : score >= 45 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'
  const scoreLabel = score >= 70 ? 'Rendimiento óptimo' : score >= 45 ? 'Necesita atención' : 'Acción urgente'
  const scoreDesc = score >= 70
    ? 'Tus campañas están funcionando bien. Considera escalar el presupuesto en lo que da resultados.'
    : score >= 45
    ? 'Hay áreas donde estás dejando dinero sobre la mesa. Revisa las alertas abajo.'
    : 'Tus campañas tienen problemas que cuestan dinero cada día. Actúa ahora.'

  const circumference = 2 * Math.PI * 52
  const offset = circumference - (score / 100) * circumference

  const critical = diagnoses.filter(d => d.status === 'critical').length
  const warnings = diagnoses.filter(d => d.status === 'warning').length
  const optimal = 9 - critical - warnings

  async function handlePDF() {
    setPdfLoading(true)
    await generatePDF(metrics, campaigns, isRealData)
    setPdfLoading(false)
    onDownloaded()
  }

  // Empty state
  if (isRealData && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-[#08080f] flex flex-col">
        <header className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
          <Logo />
          <button onClick={onAdvancedView} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Vista avanzada →
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
                <path d="M3 8h18M3 12h18M3 16h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-base">Cuenta conectada</p>
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">No hay campañas activas en los últimos 30 días en tu cuenta de Meta Ads.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-left space-y-2.5">
              <p className="text-slate-400 text-xs font-medium">Opciones</p>
              <p className="text-slate-500 text-xs">· Activa una campaña en Ads Manager y vuelve a conectar</p>
              <p className="text-slate-500 text-xs">· Sube un CSV con tus métricas históricas</p>
            </div>
            <button onClick={onUploadCSV} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
              Subir CSV
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080f]">

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#08080f]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            {!isRealData && (
              <button onClick={onUploadCSV} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                Subir datos
              </button>
            )}
            <button onClick={handlePDF} disabled={pdfLoading}
              className="text-xs text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
              {pdfLoading ? 'Generando...' : 'Exportar PDF'}
            </button>
            <button onClick={onAdvancedView}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors pl-1">
              Avanzado →
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-5">

        {/* Demo banner */}
        {!isRealData && (
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-amber-400 text-xs font-medium">Modo demostración</p>
              <p className="text-amber-400/60 text-xs mt-0.5">Conecta Meta Ads o sube un CSV para ver tus datos reales</p>
            </div>
            <button onClick={onUploadCSV} className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0">
              Subir datos
            </button>
          </div>
        )}

        {/* Score hero */}
        <div
          className="rounded-2xl p-7 border border-white/[0.06] relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, #0f0f18 0%, #0d0d16 100%)` }}
        >
          {/* Glow background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full blur-3xl opacity-30" style={{ background: scoreGlow }} />
          </div>

          <div className="relative flex items-center gap-7">
            {/* Circle */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor} strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${scoreColor}60)` }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white leading-none">{score}</span>
                <span className="text-xs text-slate-500 mt-0.5">/100</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md mb-2" style={{ background: `${scoreColor}18`, border: `1px solid ${scoreColor}30` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: scoreColor }} />
                <span className="text-xs font-medium" style={{ color: scoreColor }}>{scoreLabel}</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{scoreDesc}</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="text-center">
                  <p className="text-emerald-400 font-bold text-lg leading-none">{optimal}</p>
                  <p className="text-slate-600 text-xs mt-0.5">Óptimas</p>
                </div>
                <div className="w-px h-6 bg-white/5" />
                <div className="text-center">
                  <p className="text-amber-400 font-bold text-lg leading-none">{warnings}</p>
                  <p className="text-slate-600 text-xs mt-0.5">Alertas</p>
                </div>
                <div className="w-px h-6 bg-white/5" />
                <div className="text-center">
                  <p className="text-red-400 font-bold text-lg leading-none">{critical}</p>
                  <p className="text-slate-600 text-xs mt-0.5">Críticas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-300 text-sm font-medium">Métricas</p>
            <p className="text-slate-600 text-xs">Últimos 30 días</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
            {METRICS.map((m) => {
              const value = metrics[m.key as keyof MetricValues]
              const status = getMetricStatus(m.key, value)
              const info = simpleLabels[m.key]
              const dot = status === 'optimal' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444'
              const badge = status === 'optimal'
                ? 'text-emerald-400 bg-emerald-400/10'
                : status === 'warning'
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-red-400 bg-red-400/10'
              const badgeText = status === 'optimal' ? 'Bien' : status === 'warning' ? 'Revisar' : 'Crítico'
              return (
                <div key={m.key} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot, boxShadow: `0 0 5px ${dot}80` }} />
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <p className="text-slate-400 text-sm truncate">{info.label}</p>
                    <Tooltip text={info.tooltip} />
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <p className="text-white font-semibold text-sm tabular-nums">{m.format(value)}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${badge}`}>{badgeText}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alerts */}
        {diagnoses.length > 0 && (
          <div>
            <p className="text-slate-300 text-sm font-medium mb-3">Alertas activas</p>
            <div className="space-y-2">
              {diagnoses.map((d, i) => {
                const metricKey = METRICS.find(m => m.label === d.metric)?.key ?? ''
                const alerts = simpleAlerts[metricKey]
                const action = simpleActions[metricKey]
                const isCritical = d.status === 'critical'
                return (
                  <div key={i} className={`rounded-xl border overflow-hidden ${
                    isCritical ? 'border-red-500/15 bg-red-500/5' : 'border-amber-500/15 bg-amber-500/5'
                  }`}>
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className={`text-xs font-semibold ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>{d.metric}</p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                          isCritical ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>{isCritical ? 'Urgente' : 'Revisar'}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {alerts?.[d.status === 'critical' ? 'critical' : 'warning'] ?? d.cause}
                      </p>
                    </div>
                    {action && (
                      <div className="border-t border-white/[0.05] bg-indigo-500/5 px-4 py-2.5">
                        <p className="text-xs text-indigo-300">
                          <span className="font-medium text-indigo-400">Acción: </span>{action}
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
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-300 text-sm font-medium">Plan de acción</p>
            <p className="text-slate-600 text-xs">Ordenado por prioridad</p>
          </div>
          <div className="space-y-2">
            {recommendations.slice(0, 5).map((r, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 flex items-start gap-3 hover:bg-white/[0.03] transition-colors">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                  i === 0 ? 'bg-red-500 text-white' : i === 1 ? 'bg-orange-500 text-white' : i === 2 ? 'bg-amber-500 text-black' : 'bg-white/8 text-slate-500'
                }`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm">{r.action}</p>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Impacto estimado: <span className="text-emerald-400/80">{r.estimatedGain}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaigns */}
        {campaigns.length > 0 && (
          <div>
            <p className="text-slate-300 text-sm font-medium mb-3">Campañas</p>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
              {campaigns.map((c, i) => {
                const dot = c.health === 'optimal' ? '#10b981' : c.health === 'warning' ? '#f59e0b' : '#ef4444'
                const msg = c.health === 'optimal' ? 'Funcionando bien' : c.health === 'warning' ? 'Puede mejorar' : 'Necesita atención'
                const msgColor = c.health === 'optimal' ? 'text-emerald-400' : c.health === 'warning' ? 'text-amber-400' : 'text-red-400'
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
                    <p className="text-slate-300 text-sm flex-1 min-w-0 truncate">{c.name}</p>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {c.roas > 0 && <p className="text-white text-sm font-semibold tabular-nums">{c.roas.toFixed(1)}x</p>}
                      <p className={`text-xs ${msgColor}`}>{msg}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PDF CTA */}
        <div className="border border-white/[0.06] rounded-2xl px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-slate-200 text-sm font-medium">Exportar reporte</p>
            <p className="text-slate-500 text-xs mt-0.5">PDF con todas las métricas y recomendaciones</p>
          </div>
          <button onClick={handlePDF} disabled={pdfLoading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">
            {pdfLoading ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>

        <p className="text-center text-slate-700 text-xs pb-4">Metrixa · {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
