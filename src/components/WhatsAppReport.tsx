import { useState } from 'react'
import type { MetricValues, Campaign } from '../data/mockData'
import { calculateHealthScore, generateDiagnosis, getMetricStatus } from '../utils/scoring'
import { generateRecommendations } from '../utils/recommendations'

interface Props {
  metrics: MetricValues
  campaigns: Campaign[]
  clientName?: string
}

export default function WhatsAppReport({ metrics, campaigns, clientName: initialName = 'Cliente' }: Props) {
  const [clientName, setClientName] = useState(initialName)
  const [agencyName, setAgencyName] = useState('Nexora')
  const [period, setPeriod] = useState('esta semana')
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'summary' | 'full'>('summary')

  const score = calculateHealthScore(metrics)
  const diagnoses = generateDiagnosis(metrics)
  const recommendations = generateRecommendations(metrics)
  const critical = diagnoses.filter(d => d.status === 'critical')
  const warnings = diagnoses.filter(d => d.status === 'warning')

  const scoreEmoji = score >= 70 ? '🟢' : score >= 45 ? '🟡' : '🔴'
  const scoreLabel = score >= 70 ? 'Saludable' : score >= 45 ? 'Necesita atención' : 'En riesgo'

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const avgRoas = campaigns.filter(c => c.roas > 0).reduce((s, c) => s + c.roas, 0) / campaigns.filter(c => c.roas > 0).length || 0
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0)
  const optimalCamps = campaigns.filter(c => c.health === 'optimal').length
  const criticalCamps = campaigns.filter(c => c.health === 'critical').length

  const summaryText = `📊 *Reporte de Publicidad — ${period}*
${agencyName} para ${clientName}

${scoreEmoji} *Score de salud: ${score}/100 — ${scoreLabel}*

💰 *Resumen de inversión:*
• Gasto total: $${totalSpend.toLocaleString()}
• ROAS promedio: ${avgRoas.toFixed(1)}x
• Conversiones: ${totalConversions}
• Campañas activas: ${campaigns.filter(c => c.status === 'active').length}

📈 *Estado de campañas:*
• ✅ Óptimas: ${optimalCamps}
• ⚠️ Con alertas: ${campaigns.filter(c => c.health === 'warning').length}
• 🔴 Críticas: ${criticalCamps}
${criticalCamps > 0 ? `\n🚨 *Atención urgente:*\n${critical.slice(0, 2).map(d => `• ${d.metric}: ${d.cause.slice(0, 80)}...`).join('\n')}` : ''}
${warnings.length > 0 ? `\n⚠️ *En seguimiento:*\n${warnings.slice(0, 2).map(d => `• ${d.metric}`).join('\n')}` : ''}

✅ *Próximos pasos:*
${recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r.action}`).join('\n')}

_Análisis generado por Metrixa_`

  const fullText = `📊 *REPORTE COMPLETO DE META ADS — ${period.toUpperCase()}*
${agencyName} | Análisis para ${clientName}
━━━━━━━━━━━━━━━━━━━━

${scoreEmoji} *SALUD GENERAL: ${score}/100 — ${scoreLabel}*

━━━━━━━━━━━━━━━━━━━━
💰 *RESUMEN FINANCIERO*

• Inversión del período: $${totalSpend.toLocaleString()}
• Revenue generado: $${Math.round(totalSpend * avgRoas).toLocaleString()}
• ROAS promedio: ${avgRoas.toFixed(2)}x
• Conversiones totales: ${totalConversions}
• CPA promedio: $${metrics.cpa.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━
📊 *MÉTRICAS CLAVE*

• CTR: ${metrics.ctr_all.toFixed(2)}% ${getMetricStatus('ctr_all', metrics.ctr_all) === 'optimal' ? '✅' : getMetricStatus('ctr_all', metrics.ctr_all) === 'warning' ? '⚠️' : '🔴'}
• ROAS: ${metrics.roas.toFixed(2)}x ${getMetricStatus('roas', metrics.roas) === 'optimal' ? '✅' : getMetricStatus('roas', metrics.roas) === 'warning' ? '⚠️' : '🔴'}
• Frecuencia: ${metrics.frequency.toFixed(1)} ${getMetricStatus('frequency', metrics.frequency) === 'optimal' ? '✅' : getMetricStatus('frequency', metrics.frequency) === 'warning' ? '⚠️' : '🔴'}
• CPC: $${metrics.cpc.toFixed(2)} ${getMetricStatus('cpc', metrics.cpc) === 'optimal' ? '✅' : getMetricStatus('cpc', metrics.cpc) === 'warning' ? '⚠️' : '🔴'}
• Tasa de conversión: ${metrics.conv_rate.toFixed(2)}% ${getMetricStatus('conv_rate', metrics.conv_rate) === 'optimal' ? '✅' : getMetricStatus('conv_rate', metrics.conv_rate) === 'warning' ? '⚠️' : '🔴'}
• Relevancia: ${metrics.relevance.toFixed(1)}/10 ${getMetricStatus('relevance', metrics.relevance) === 'optimal' ? '✅' : getMetricStatus('relevance', metrics.relevance) === 'warning' ? '⚠️' : '🔴'}

━━━━━━━━━━━━━━━━━━━━
🏕️ *ESTADO POR CAMPAÑA*

${campaigns.map(c => `${c.health === 'optimal' ? '🟢' : c.health === 'warning' ? '🟡' : '🔴'} ${c.name}\n   ROAS: ${c.roas.toFixed(1)}x | CPA: $${c.cpa.toFixed(0)} | CTR: ${c.ctr.toFixed(1)}%`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━
${critical.length > 0 ? `🚨 *ALERTAS CRÍTICAS (acción inmediata)*\n\n${critical.map(d => `🔴 *${d.metric}*\n→ ${d.cause.slice(0, 100)}\n✦ Solución: ${d.solution.slice(0, 100)}`).join('\n\n')}\n\n━━━━━━━━━━━━━━━━━━━━\n` : ''}
✅ *PLAN DE ACCIÓN — PRÓXIMA SEMANA*

${recommendations.slice(0, 5).map((r, i) => `${i + 1}. *${r.action}*\n   Resultado esperado: ${r.estimatedGain}`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━
_Análisis generado con Metrixa_
_${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}_`

  const text = mode === 'summary' ? summaryText : fullText

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#1a1b25] rounded-2xl border border-white/5">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          💬 Plantilla de Reporte para WhatsApp
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">Listo para copiar y pegar — con formato nativo de WhatsApp</p>
      </div>

      <div className="px-6 pb-6 grid lg:grid-cols-2 gap-5">
        {/* Config */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Nombre del cliente</label>
            <input
              value={clientName} onChange={e => setClientName(e.target.value)}
              className="w-full bg-[#13141e] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
              placeholder="Ej: María García"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Nombre de tu agencia</label>
            <input
              value={agencyName} onChange={e => setAgencyName(e.target.value)}
              className="w-full bg-[#13141e] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
              placeholder="Ej: Nexora"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Período del reporte</label>
            <input
              value={period} onChange={e => setPeriod(e.target.value)}
              className="w-full bg-[#13141e] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
              placeholder="Ej: semana del 24–30 de junio"
            />
          </div>

          {/* Mode selector */}
          <div>
            <label className="text-xs text-gray-400 block mb-2">Tipo de reporte</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('summary')}
                className={`flex-1 text-xs py-2 rounded-xl border transition-colors font-medium ${mode === 'summary' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
              >
                📋 Resumen rápido
              </button>
              <button
                onClick={() => setMode('full')}
                className={`flex-1 text-xs py-2 rounded-xl border transition-colors font-medium ${mode === 'full' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
              >
                📊 Reporte completo
              </button>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'}`}
          >
            {copied ? '✅ ¡Copiado al portapapeles!' : '📋 Copiar para WhatsApp'}
          </button>

          <p className="text-xs text-gray-600 text-center">
            Pega directamente en WhatsApp — el formato negrita y emojis se conserva
          </p>
        </div>

        {/* Preview */}
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Vista previa</p>
          <div className="bg-[#075e54] rounded-2xl p-1 h-80 overflow-hidden">
            <div className="bg-[#0d1117] rounded-xl h-full overflow-y-auto p-3">
              <div className="bg-[#1f2c33] rounded-xl p-3 inline-block max-w-full">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
