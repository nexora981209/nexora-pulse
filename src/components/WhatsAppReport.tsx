'use client'
import { useState } from 'react'
import type { MetricValues, Campaign } from '../data/mockData'
import { calculateHealthScore, generateDiagnosis } from '../utils/scoring'
import { generateRecommendations } from '../utils/recommendations'

interface Props {
  metrics: MetricValues
  campaigns: Campaign[]
  clientName?: string
}

interface Template {
  id: string
  name: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  status: 'APPROVED' | 'PENDING'
  language: string
  preview: (vars: TemplateVars) => string
  header?: string
  footer?: string
  buttons?: string[]
}

interface TemplateVars {
  clientName: string
  agencyName: string
  period: string
  score: number
  scoreLabel: string
  roas: string
  spend: string
  ctr: string
  criticalCount: number
  topAction: string
  campaignCount: number
}

const TEMPLATES: Template[] = [
  {
    id: 'weekly_summary',
    name: 'Reporte Semanal',
    category: 'MARKETING',
    status: 'APPROVED',
    language: 'es',
    header: 'REPORTE DE RENDIMIENTO',
    footer: 'Metrixa · Análisis de Meta Ads',
    buttons: ['Ver dashboard completo', 'Agendar reunión'],
    preview: (v) =>
`Hola ${v.clientName} 👋

Tu reporte de Meta Ads está listo.

📊 *Salud de campañas: ${v.score}/100*
${v.score >= 70 ? '🟢 Rendimiento óptimo' : v.score >= 45 ? '🟡 Necesita atención' : '🔴 Acción urgente'}

*Resumen del período (${v.period}):*
• Inversión: ${v.spend}
• ROAS: ${v.roas}x
• CTR promedio: ${v.ctr}%
• Campañas activas: ${v.campaignCount}

*Próximo paso prioritario:*
${v.topAction}

— ${v.agencyName}`,
  },
  {
    id: 'critical_alert',
    name: 'Alerta Crítica',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'es',
    header: '⚠️ ALERTA DE CAMPAÑA',
    footer: 'Metrixa · Alertas automáticas',
    buttons: ['Revisar ahora', 'Ignorar'],
    preview: (v) =>
`${v.clientName}, detectamos ${v.criticalCount} campaña${v.criticalCount !== 1 ? 's' : ''} con rendimiento crítico.

🔴 *Acción requerida hoy*

Las métricas actuales indican que estás perdiendo presupuesto sin resultados óptimos.

*Problema detectado:*
${v.topAction}

*Score actual: ${v.score}/100*

Responde a este mensaje para coordinar una solución.

— ${v.agencyName}`,
  },
  {
    id: 'monthly_results',
    name: 'Resultados del Mes',
    category: 'MARKETING',
    status: 'APPROVED',
    language: 'es',
    header: 'CIERRE DE MES',
    footer: 'Metrixa · Reportes profesionales',
    buttons: ['Descargar PDF completo'],
    preview: (v) =>
`*Resultados de ${v.period}*
${v.agencyName} para ${v.clientName}

━━━━━━━━━━━━━━━
📈 *RESUMEN EJECUTIVO*

• ROAS del período: *${v.roas}x*
• Inversión total: *${v.spend}*
• CTR: *${v.ctr}%*

*Salud general: ${v.score}/100 — ${v.scoreLabel}*
━━━━━━━━━━━━━━━

${v.score >= 70 ? '✅ Cerramos el mes con campañas en verde. Las estrategias implementadas están funcionando.' : '📋 Tenemos un plan de mejora para el próximo mes basado en los datos de este período.'}

El reporte PDF completo ya está disponible.`,
  },
  {
    id: 'budget_alert',
    name: 'Presupuesto Bajo',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'es',
    header: '💰 AVISO DE PRESUPUESTO',
    footer: 'Metrixa · Monitoreo automático',
    buttons: ['Recargar presupuesto', 'Pausar campañas'],
    preview: (v) =>
`${v.clientName}, tu presupuesto en Meta Ads está próximo a agotarse.

*Inversión actual: ${v.spend}*
*Campañas activas: ${v.campaignCount}*

Para mantener el rendimiento de tus campañas sin interrupciones, te recomendamos recargar antes de que se detenga la pauta.

El ROAS actual de *${v.roas}x* indica que cada dólar invertido está generando retorno positivo.

— ${v.agencyName}`,
  },
  {
    id: 'quick_win',
    name: 'Oportunidad Detectada',
    category: 'MARKETING',
    status: 'APPROVED',
    language: 'es',
    header: '🚀 OPORTUNIDAD',
    footer: 'Metrixa · Inteligencia de campañas',
    buttons: ['Activar optimización', 'Ver análisis'],
    preview: (v) =>
`${v.clientName}, identificamos una oportunidad de mejora en tus campañas.

💡 *Optimización disponible:*
${v.topAction}

Implementar este cambio puede mejorar tu ROAS actual de *${v.roas}x* en las próximas 48 horas.

¿Quieres que lo activemos esta semana?

— ${v.agencyName}`,
  },
]

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  MARKETING:       { label: 'Marketing', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  UTILITY:         { label: 'Utilidad',  color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20'  },
  AUTHENTICATION:  { label: 'Auth',      color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20'},
}

function MetaApprovalBadge({ status }: { status: 'APPROVED' | 'PENDING' }) {
  return status === 'APPROVED' ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
      <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" />
      APROBADA
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
      <span className="w-1 h-1 rounded-full bg-amber-400 inline-block" />
      PENDIENTE
    </span>
  )
}

function WhatsAppBubble({ text, header, footer, buttons }: { text: string; header?: string; footer?: string; buttons?: string[] }) {
  return (
    <div className="max-w-[300px] font-sans">
      <div className="bg-[#202c33] rounded-t-xl rounded-br-xl rounded-bl-sm shadow-md overflow-hidden">
        {header && (
          <div className="bg-[#111b21] px-3 py-2 border-b border-white/5">
            <p className="text-[10px] font-bold text-white/80 tracking-wider">{header}</p>
          </div>
        )}
        <div className="px-3 py-2.5">
          <pre className="text-[11px] text-[#e9edef] whitespace-pre-wrap font-sans leading-[1.55] break-words">{text}</pre>
          <p className="text-[9px] text-[#8696a0] text-right mt-1.5">12:35 ✓✓</p>
        </div>
        {footer && (
          <div className="border-t border-white/5 px-3 py-1.5">
            <p className="text-[9px] text-[#8696a0]">{footer}</p>
          </div>
        )}
      </div>
      {buttons && buttons.length > 0 && (
        <div className="mt-0.5 space-y-0.5">
          {buttons.map((btn, i) => (
            <button key={i} className="w-full bg-[#202c33] hover:bg-[#2a3942] text-[#53bdeb] text-[11px] font-medium py-2 rounded-sm transition-colors text-center border border-[#2a3942]">
              {btn}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function WhatsAppReport({ metrics, campaigns, clientName: initialName = 'Cliente' }: Props) {
  const [clientName, setClientName] = useState(initialName)
  const [agencyName, setAgencyName] = useState('Nexora')
  const [period, setPeriod] = useState('julio 2025')
  const [clientPhone, setClientPhone] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('weekly_summary')
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates')

  const score = calculateHealthScore(metrics)
  const diagnoses = generateDiagnosis(metrics)
  const recommendations = generateRecommendations(metrics)
  const critical = diagnoses.filter(d => d.status === 'critical')

  const scoreLabel = score >= 70 ? 'Saludable' : score >= 45 ? 'Necesita atención' : 'En riesgo'
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const avgRoas = campaigns.filter(c => c.roas > 0).reduce((s, c) => s + c.roas, 0) / (campaigns.filter(c => c.roas > 0).length || 1)

  const vars: TemplateVars = {
    clientName,
    agencyName,
    period,
    score,
    scoreLabel,
    roas: avgRoas.toFixed(1),
    spend: `$${totalSpend.toLocaleString()}`,
    ctr: metrics.ctr_all.toFixed(2),
    criticalCount: critical.length,
    topAction: recommendations[0]?.action ?? 'Revisar métricas de conversión',
    campaignCount: campaigns.filter(c => c.status === 'active').length,
  }

  const template = TEMPLATES.find(t => t.id === selectedTemplate) ?? TEMPLATES[0]
  const previewText = template.preview(vars)

  // Custom mode
  const [customMode, setCustomMode] = useState<'summary' | 'full'>('summary')
  const summaryText = `📊 *Reporte de Publicidad — ${period}*\n${agencyName} para ${clientName}\n\n${score >= 70 ? '🟢' : score >= 45 ? '🟡' : '🔴'} *Score: ${score}/100 — ${scoreLabel}*\n\n💰 Inversión: ${vars.spend} | ROAS: ${vars.roas}x\n📈 CTR: ${vars.ctr}% | Campañas: ${vars.campaignCount}\n\n✅ *Próximo paso:*\n${vars.topAction}\n\n_Análisis generado por Metrixa_`
  const fullText = `📊 *REPORTE COMPLETO — ${period.toUpperCase()}*\n${agencyName} | ${clientName}\n━━━━━━━━━━━━━━━━━━━━\n\n${score >= 70 ? '🟢' : score >= 45 ? '🟡' : '🔴'} *SALUD GENERAL: ${score}/100 — ${scoreLabel}*\n\n━━━━━━━━━━━━━━━━━━━━\n💰 *FINANCIERO*\n• Inversión: ${vars.spend}\n• ROAS: ${vars.roas}x\n• CTR: ${vars.ctr}%\n• CPC: $${metrics.cpc.toFixed(2)}\n\n━━━━━━━━━━━━━━━━━━━━\n✅ *PLAN DE ACCIÓN*\n${recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r.action}`).join('\n')}\n\n_Metrixa · ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}_`

  const textToCopy = activeTab === 'templates' ? previewText : (customMode === 'summary' ? summaryText : fullText)

  function handleCopy() {
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSend() {
    const clean = clientPhone.replace(/\D/g, '')
    if (clean.length < 8) {
      setSendResult({ ok: false, msg: 'Ingresa un número válido con código de país (ej: 573001234567)' })
      return
    }
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: clean, text: textToCopy }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setSendResult({ ok: true, msg: `Enviado a ${clientPhone}` })
      } else {
        setSendResult({ ok: false, msg: data.error ?? 'Error al enviar' })
      }
    } catch (err) {
      setSendResult({ ok: false, msg: String(err) })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/[0.06] flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9c0 1.32.36 2.55.99 3.6L1.5 16.5l3.99-1.05A7.47 7.47 0 0 0 9 16.5c4.14 0 7.5-3.36 7.5-7.5S13.14 1.5 9 1.5z" stroke="#10b981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.75 7.5c0-.83.67-1.5 1.5-1.5h.75C9.83 6 10.5 6.67 10.5 7.5c0 .62-.38 1.17-.94 1.4L9 9.13V10.5" stroke="#10b981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-sm">Plantillas WhatsApp Business</h3>
              <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md">META BUSINESS API</span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Plantillas aprobadas por Meta · Formato nativo de WhatsApp</p>
          </div>
        </div>
        {/* Meta verification badge */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5 flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9.5L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z" fill="#1877F2"/>
          </svg>
          <span className="text-[10px] text-slate-400 font-medium">Verificado por Meta</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 flex gap-1 border-b border-white/[0.04] pb-0">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'templates'
              ? 'text-white border-indigo-500'
              : 'text-slate-500 hover:text-slate-300 border-transparent'
          }`}
        >
          Plantillas autorizadas
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'custom'
              ? 'text-white border-indigo-500'
              : 'text-slate-500 hover:text-slate-300 border-transparent'
          }`}
        >
          Personalizado
        </button>
      </div>

      <div className="p-6 grid lg:grid-cols-[1fr_auto] gap-6 items-start">

        {/* Left: controls */}
        <div className="space-y-5 min-w-0">

          {/* Client fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1.5">Cliente</label>
              <input value={clientName} onChange={e => setClientName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500/50 placeholder-slate-700"
                placeholder="Nombre del cliente" />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1.5">Agencia</label>
              <input value={agencyName} onChange={e => setAgencyName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500/50 placeholder-slate-700"
                placeholder="Tu agencia" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium block mb-1.5">Período</label>
            <input value={period} onChange={e => setPeriod(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500/50 placeholder-slate-700"
              placeholder="Ej: julio 2025" />
          </div>

          {/* Phone number for direct send */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-slate-500 font-medium">Número del cliente</label>
              <span className="text-[10px] text-slate-600">Con código de país</span>
            </div>
            <div className="flex gap-2">
              <input value={clientPhone} onChange={e => { setClientPhone(e.target.value); setSendResult(null) }}
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500/50 placeholder-slate-700 font-mono"
                placeholder="573001234567" type="tel" />
              <button
                onClick={handleSend}
                disabled={sending || !clientPhone.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                {sending ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="white"><path d="M2 7l10-5-5 10V7H2z"/></svg>
                )}
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
            {sendResult && (
              <div className={`mt-2 px-3 py-2 rounded-lg text-[11px] font-medium ${
                sendResult.ok
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {sendResult.ok ? '✓ ' : '✗ '}{sendResult.msg}
              </div>
            )}
          </div>

          {activeTab === 'templates' ? (
            <>
              {/* Template list */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-[11px] text-slate-500 font-medium">Plantilla</label>
                  <span className="text-[10px] text-slate-600">{TEMPLATES.length} disponibles</span>
                </div>
                <div className="space-y-1.5">
                  {TEMPLATES.map(t => {
                    const cat = CATEGORY_LABELS[t.category]
                    const isSelected = t.id === selectedTemplate
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-indigo-600/10 border-indigo-500/30 text-white'
                            : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-slate-300'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-indigo-400' : 'bg-white/20'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{t.name}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${cat.bg} ${cat.color}`}>{cat.label}</span>
                          <MetaApprovalBadge status={t.status} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Template info */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 space-y-2">
                <p className="text-[11px] text-slate-500 font-medium">Variables automáticas</p>
                <div className="flex flex-wrap gap-1.5">
                  {[`{{cliente}}`, `{{agencia}}`, `{{período}}`, `{{score}}`, `{{ROAS}}`, `{{CTR}}`, `{{inversión}}`].map(v => (
                    <span key={v} className="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/15 px-1.5 py-0.5 rounded font-mono">{v}</span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600">Rellenas automáticamente con tus datos de Meta Ads</p>
              </div>
            </>
          ) : (
            /* Custom mode */
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-2.5">Tipo de mensaje</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCustomMode('summary')}
                  className={`flex-1 text-xs py-2 rounded-xl border transition-colors font-medium ${customMode === 'summary' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'}`}
                >
                  Resumen rápido
                </button>
                <button
                  onClick={() => setCustomMode('full')}
                  className={`flex-1 text-xs py-2 rounded-xl border transition-colors font-medium ${customMode === 'full' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'}`}
                >
                  Reporte completo
                </button>
              </div>
            </div>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {copied ? 'Copiado al portapapeles' : 'Copiar plantilla'}
          </button>

          <p className="text-[10px] text-slate-600 text-center">
            Pega en WhatsApp · El formato negrita y saltos de línea se conservan
          </p>
        </div>

        {/* Right: WhatsApp preview */}
        <div className="w-[300px] flex-shrink-0">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-medium">Vista previa</p>
            <span className="text-[10px] text-slate-600">WhatsApp Business</span>
          </div>

          {/* Phone mockup */}
          <div className="bg-[#0b141a] rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl">
            {/* Status bar */}
            <div className="bg-[#1f2c33] px-4 py-2.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2a3942] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{agencyName[0]}</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-[11px] font-semibold">{agencyName}</p>
                <p className="text-[#8696a0] text-[9px]">Business · En línea</p>
              </div>
              <div className="flex gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="#8696a0"><path d="M6.5 2a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 6.5 2zM1 8.5a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0z"/></svg>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="#8696a0"><circle cx="4" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="12" cy="8" r="1.5"/></svg>
              </div>
            </div>

            {/* Chat area */}
            <div
              className="px-3 py-4 min-h-[320px] relative overflow-y-auto"
              style={{ background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%230b141a\'/%3E%3C/svg%3E") #0b141a' }}
            >
              {/* Date chip */}
              <div className="flex justify-center mb-3">
                <span className="bg-[#182229] text-[#8696a0] text-[9px] px-2.5 py-0.5 rounded-full">HOY</span>
              </div>

              <div className="flex justify-end">
                <WhatsAppBubble
                  text={activeTab === 'templates' ? previewText : (customMode === 'summary' ? summaryText : fullText)}
                  header={activeTab === 'templates' ? template.header : undefined}
                  footer={activeTab === 'templates' ? template.footer : undefined}
                  buttons={activeTab === 'templates' ? template.buttons : undefined}
                />
              </div>
            </div>

            {/* Input bar */}
            <div className="bg-[#1f2c33] px-3 py-2.5 flex items-center gap-2">
              <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5">
                <p className="text-[#8696a0] text-[10px]">Escribe un mensaje</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="white"><path d="M2 7l10-5-5 10V7H2z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
