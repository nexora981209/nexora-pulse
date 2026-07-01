import { MetricValues, Campaign, METRICS } from '../data/mockData'

function toCSV(rows: string[][]): string {
  return rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportMetricsCSV(metrics: MetricValues, score: number) {
  const date = new Date().toISOString().split('T')[0]
  const rows: string[][] = [
    ['Nexora Pulse — Reporte de Métricas Meta Ads'],
    ['Fecha', date],
    ['Score de Salud', String(score) + '/100'],
    [],
    ['Métrica', 'Valor Actual', 'Rango Ideal', 'Unidad'],
  ]

  for (const m of METRICS) {
    const value = metrics[m.key as keyof MetricValues]
    rows.push([m.label, m.format(value), m.idealLabel, m.unit])
  }

  downloadCSV(toCSV(rows), `nexora-pulse-metricas-${date}.csv`)
}

export function exportCampaignsCSV(campaigns: Campaign[]) {
  const date = new Date().toISOString().split('T')[0]
  const rows: string[][] = [
    ['Campaña', 'Estado', 'Presupuesto ($)', 'Gasto ($)', 'ROAS', 'CTR (%)', 'CPA ($)', 'Conversiones', 'Salud'],
  ]

  for (const c of campaigns) {
    rows.push([
      c.name,
      c.status === 'active' ? 'Activa' : c.status === 'paused' ? 'Pausada' : 'Finalizada',
      String(c.budget),
      String(c.spend),
      c.roas.toFixed(2),
      c.ctr.toFixed(2),
      c.cpa.toFixed(2),
      String(c.conversions),
      c.health === 'optimal' ? 'Óptimo' : c.health === 'warning' ? 'Atención' : 'Crítico',
    ])
  }

  downloadCSV(toCSV(rows), `nexora-pulse-campanas-${date}.csv`)
}
