import jsPDF from 'jspdf'
import type { MetricValues, Campaign } from '../data/mockData'
import { METRICS } from '../data/mockData'
import { calculateHealthScore, generateDiagnosis, getMetricStatus } from './scoring'

const BLUE = '#3B82F6'
const PURPLE = '#7C3AED'
const DARK = '#0f0f14'
const CARD = '#1a1b25'
const TEXT = '#e5e7eb'
const MUTED = '#6b7280'

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function setFill(doc: jsPDF, hex: string) {
  const { r, g, b } = hexToRgb(hex)
  doc.setFillColor(r, g, b)
}

function setTextColor(doc: jsPDF, hex: string) {
  const { r, g, b } = hexToRgb(hex)
  doc.setTextColor(r, g, b)
}

function setDrawColor(doc: jsPDF, hex: string) {
  const { r, g, b } = hexToRgb(hex)
  doc.setDrawColor(r, g, b)
}

const statusColor: Record<string, string> = {
  optimal: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
}
const statusLabel: Record<string, string> = {
  optimal: 'Óptimo',
  warning: 'Atención',
  critical: 'Crítico',
}

export async function generatePDF(metrics: MetricValues, campaigns: Campaign[], isRealData: boolean) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const score = calculateHealthScore(metrics)
  const diagnoses = generateDiagnosis(metrics)

  // ── PAGE 1: Cover + KPIs ──────────────────────────────────────────────────

  // Background
  setFill(doc, DARK)
  doc.rect(0, 0, W, 297, 'F')

  // Header gradient bar
  setFill(doc, BLUE)
  doc.rect(0, 0, W / 2, 3, 'F')
  setFill(doc, PURPLE)
  doc.rect(W / 2, 0, W / 2, 3, 'F')

  // Logo box
  setFill(doc, PURPLE)
  doc.roundedRect(14, 10, 10, 10, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setTextColor(doc, '#ffffff')
  doc.text('N', 17.5, 17)

  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  setTextColor(doc, TEXT)
  doc.text('Nexora Pulse', 28, 16)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  setTextColor(doc, MUTED)
  doc.text('Meta Ads Intelligence Dashboard', 28, 21)

  // Date + data source
  doc.setFontSize(8)
  setTextColor(doc, MUTED)
  doc.text(date, W - 14, 14, { align: 'right' })
  setTextColor(doc, isRealData ? BLUE : MUTED)
  doc.text(isRealData ? '📊 Datos reales' : '🧪 Datos demo', W - 14, 20, { align: 'right' })

  // Divider
  setDrawColor(doc, '#2a2b35')
  doc.setLineWidth(0.3)
  doc.line(14, 26, W - 14, 26)

  // Health Score section
  let y = 34

  // Score circle (simulated with filled circle + text)
  const cx = 30, cy = y + 14
  const scoreColor = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
  setFill(doc, CARD)
  doc.circle(cx, cy, 12, 'F')
  setDrawColor(doc, scoreColor)
  doc.setLineWidth(1.5)
  doc.circle(cx, cy, 12, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  setTextColor(doc, '#ffffff')
  doc.text(String(score), cx, cy + 1.5, { align: 'center' })
  doc.setFontSize(6)
  setTextColor(doc, MUTED)
  doc.text('/100', cx, cy + 6, { align: 'center' })

  // Score label
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  setTextColor(doc, '#ffffff')
  const scoreLabel = score >= 70 ? 'Saludable' : score >= 45 ? 'Necesita atención' : 'En riesgo'
  doc.text(`Score de Salud: ${scoreLabel}`, 48, y + 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setTextColor(doc, MUTED)
  const scoreDesc = score >= 70
    ? 'Las campañas están dentro de parámetros óptimos.'
    : score >= 45
    ? 'Hay métricas que requieren atención. Ver diagnóstico.'
    : 'Varias métricas en zona crítica. Acción inmediata requerida.'
  doc.text(scoreDesc, 48, y + 16)

  // Alerts summary
  const critical = diagnoses.filter(d => d.status === 'critical').length
  const warnings = diagnoses.filter(d => d.status === 'warning').length
  doc.setFontSize(8)
  setTextColor(doc, '#ef4444')
  doc.text(`${critical} críticas`, 48, y + 22)
  setTextColor(doc, '#f59e0b')
  doc.text(`${warnings} alertas`, 75, y + 22)

  y += 34

  // Section: KPIs
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setTextColor(doc, '#ffffff')
  doc.text('Métricas KPI', 14, y)
  setDrawColor(doc, BLUE)
  doc.setLineWidth(0.5)
  doc.line(14, y + 2, 50, y + 2)
  y += 7

  // KPI grid: 3 columns
  const colW = (W - 28) / 3
  const cardH = 22
  const gap = 3
  let col = 0

  for (const m of METRICS) {
    const value = metrics[m.key as keyof MetricValues]
    const status = getMetricStatus(m.key, value)
    const color = statusColor[status]
    const x = 14 + col * (colW + gap)

    setFill(doc, CARD)
    doc.roundedRect(x, y, colW, cardH, 2, 2, 'F')

    // Status dot
    setFill(doc, color)
    doc.circle(x + colW - 4, y + 4, 1.5, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setTextColor(doc, MUTED)
    doc.text(m.label, x + 3, y + 5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    setTextColor(doc, '#ffffff')
    doc.text(m.format(value), x + 3, y + 12)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    setTextColor(doc, MUTED)
    doc.text(`Ideal: ${m.idealLabel}`, x + 3, y + 17)

    setTextColor(doc, color)
    doc.text(statusLabel[status], x + 3, y + 21)

    col++
    if (col === 3) {
      col = 0
      y += cardH + gap
    }
  }

  if (col > 0) y += cardH + gap
  y += 4

  // ── PAGE 2: Diagnóstico ───────────────────────────────────────────────────
  doc.addPage()
  setFill(doc, DARK)
  doc.rect(0, 0, W, 297, 'F')
  setFill(doc, BLUE)
  doc.rect(0, 0, W / 2, 3, 'F')
  setFill(doc, PURPLE)
  doc.rect(W / 2, 0, W / 2, 3, 'F')

  y = 14
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setTextColor(doc, '#ffffff')
  doc.text('Diagnóstico Automático', 14, y)
  setDrawColor(doc, PURPLE)
  doc.setLineWidth(0.5)
  doc.line(14, y + 2, 70, y + 2)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setTextColor(doc, MUTED)
  doc.text('Análisis basado en benchmarks de Meta Ads. Prioriza los críticos primero.', 14, y)
  y += 8

  for (const d of diagnoses) {
    const color = statusColor[d.status]
    const blockH = 32

    if (y + blockH > 285) { doc.addPage(); setFill(doc, DARK); doc.rect(0, 0, W, 297, 'F'); y = 14 }

    setFill(doc, CARD)
    doc.roundedRect(14, y, W - 28, blockH, 2, 2, 'F')
    setFill(doc, color)
    doc.rect(14, y, 2, blockH, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    setTextColor(doc, color)
    doc.text(`${d.icon}  ${d.metric} — ${statusLabel[d.status]}`, 20, y + 6)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    setTextColor(doc, '#d1d5db')
    doc.text('Causa:', 20, y + 12)
    doc.setFont('helvetica', 'normal')
    setTextColor(doc, MUTED)
    const causeLines = doc.splitTextToSize(d.cause, W - 48)
    doc.text(causeLines.slice(0, 2), 35, y + 12)

    doc.setFont('helvetica', 'bold')
    setTextColor(doc, BLUE)
    doc.text('✦ Solución:', 20, y + 22)
    doc.setFont('helvetica', 'normal')
    setTextColor(doc, MUTED)
    const solLines = doc.splitTextToSize(d.solution, W - 52)
    doc.text(solLines.slice(0, 2), 42, y + 22)

    y += blockH + 3
  }

  // ── PAGE 3: Campañas ───────────────────────────────────────────────────────
  doc.addPage()
  setFill(doc, DARK)
  doc.rect(0, 0, W, 297, 'F')
  setFill(doc, BLUE)
  doc.rect(0, 0, W / 2, 3, 'F')
  setFill(doc, PURPLE)
  doc.rect(W / 2, 0, W / 2, 3, 'F')

  y = 14
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setTextColor(doc, '#ffffff')
  doc.text('Tabla de Campañas', 14, y)
  setDrawColor(doc, '#10b981')
  doc.setLineWidth(0.5)
  doc.line(14, y + 2, 60, y + 2)
  y += 10

  // Table header
  const cols = ['Campaña', 'Estado', 'ROAS', 'CTR', 'CPA', 'Conv.', 'Salud']
  const colWidths = [60, 22, 18, 18, 18, 16, 20]
  let x = 14

  setFill(doc, '#13141e')
  doc.roundedRect(14, y - 4, W - 28, 9, 1, 1, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  setTextColor(doc, MUTED)
  for (let i = 0; i < cols.length; i++) {
    doc.text(cols[i], x + 2, y + 1)
    x += colWidths[i]
  }
  y += 8

  for (const c of campaigns) {
    if (y > 280) { doc.addPage(); setFill(doc, DARK); doc.rect(0, 0, W, 297, 'F'); y = 14 }

    setFill(doc, CARD)
    doc.roundedRect(14, y - 3, W - 28, 9, 1, 1, 'F')

    const hColor = statusColor[c.health]
    x = 14
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setTextColor(doc, '#d1d5db')

    const name = c.name.length > 28 ? c.name.slice(0, 26) + '…' : c.name
    doc.text(name, x + 2, y + 2); x += colWidths[0]

    const stColor = c.status === 'active' ? '#10b981' : c.status === 'paused' ? '#f59e0b' : MUTED
    setTextColor(doc, stColor)
    doc.text(c.status === 'active' ? 'Activa' : c.status === 'paused' ? 'Pausada' : 'Finalizada', x + 2, y + 2); x += colWidths[1]

    const roasC = c.roas >= 3 ? '#10b981' : c.roas >= 2 ? '#f59e0b' : '#ef4444'
    setTextColor(doc, roasC)
    doc.text(c.roas.toFixed(1) + 'x', x + 2, y + 2); x += colWidths[2]

    const ctrC = c.ctr >= 2 ? '#10b981' : c.ctr >= 1 ? '#f59e0b' : '#ef4444'
    setTextColor(doc, ctrC)
    doc.text(c.ctr.toFixed(1) + '%', x + 2, y + 2); x += colWidths[3]

    const cpaC = c.cpa <= 15 ? '#10b981' : c.cpa <= 25 ? '#f59e0b' : '#ef4444'
    setTextColor(doc, cpaC)
    doc.text('$' + c.cpa.toFixed(1), x + 2, y + 2); x += colWidths[4]

    setTextColor(doc, '#d1d5db')
    doc.text(String(c.conversions), x + 2, y + 2); x += colWidths[5]

    setFill(doc, hColor)
    doc.circle(x + 3, y + 1, 1.5, 'F')
    setTextColor(doc, hColor)
    doc.text(statusLabel[c.health], x + 7, y + 2)

    y += 11
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    setDrawColor(doc, '#2a2b35')
    doc.setLineWidth(0.2)
    doc.line(14, 290, W - 14, 290)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    setTextColor(doc, MUTED)
    doc.text(`Nexora Pulse · ${date} · Página ${i} de ${totalPages}`, 14, 294)
    doc.text('nexora.agency', W - 14, 294, { align: 'right' })
  }

  const filename = `nexora-pulse-reporte-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}
