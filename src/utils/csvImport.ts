import type { MetricValues, Campaign } from '../data/mockData'

export interface ImportResult {
  metrics: MetricValues
  campaigns: Campaign[]
  warnings: string[]
  rawRows: Record<string, string>[]
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  // Remove BOM if present
  const clean = text.replace(/^﻿/, '').trim()
  const lines = clean.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0])
  return lines.slice(1).map((line) => {
    const vals = parseCSVLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h.trim()] = (vals[i] ?? '').trim() })
    return row
  })
}

function num(v: string | undefined): number {
  if (!v) return 0
  return parseFloat(v.replace(/[%$,x\s]/g, '')) || 0
}

// Maps possible Meta Ads column names to our keys
const COL_MAP: Record<string, string[]> = {
  ctr_all:    ['CTR (All)', 'CTR all', 'CTR (todos)', 'CTR todos', 'CTR'],
  ctr_unique: ['CTR (Unique)', 'CTR único', 'CTR (unique link click-through rate)', 'Unique CTR'],
  roas:       ['ROAS', 'Purchase ROAS', 'Website purchase ROAS', 'ROAS (Return on Ad Spend)', 'Retorno sobre inversión publicitaria (ROAS) de las compras del sitio web'],
  frequency:  ['Frequency', 'Frecuencia'],
  cpc:        ['CPC (All)', 'CPC', 'Cost per click (all)', 'Coste por clic (todos)'],
  cpa:        ['Cost per result', 'CPA', 'Cost per conversion', 'Coste por resultado'],
  conv_rate:  ['Conversion rate', 'Tasa de conversión', 'Website conversion rate', 'Result rate'],
  engagement: ['Engagement rate', 'Post engagement rate', 'Tasa de interacción'],
  relevance:  ['Relevance score', 'Quality ranking', 'Puntuación de relevancia'],
  campaign:   ['Campaign name', 'Nombre de la campaña', 'Campaign'],
  status:     ['Delivery', 'Status', 'Estado', 'Entrega'],
  budget:     ['Budget', 'Presupuesto', 'Daily budget', 'Lifetime budget'],
  spend:      ['Amount spent', 'Importe gastado', 'Spend', 'Cost'],
  conversions:['Results', 'Conversions', 'Resultados', 'Conversiones'],
}

function findCol(row: Record<string, string>, key: string): string | undefined {
  for (const alias of COL_MAP[key] ?? []) {
    if (row[alias] !== undefined) return row[alias]
    // case-insensitive fallback
    const found = Object.keys(row).find((k) => k.toLowerCase() === alias.toLowerCase())
    if (found) return row[found]
  }
  return undefined
}

function detectHealth(roas: number, ctr: number, cpa: number): Campaign['health'] {
  const bad = (roas < 2) || (cpa > 25) || (ctr < 0.8)
  const warn = (roas < 3) || (cpa > 15) || (ctr < 2)
  return bad ? 'critical' : warn ? 'warning' : 'optimal'
}

function detectStatus(raw: string | undefined): Campaign['status'] {
  const v = (raw ?? '').toLowerCase()
  if (v.includes('activ') || v.includes('active') || v.includes('en entrega')) return 'active'
  if (v.includes('paus') || v.includes('inact')) return 'paused'
  return 'ended'
}

export function importMetaCSV(text: string): ImportResult {
  const warnings: string[] = []
  const rows = parseCSV(text)

  if (rows.length === 0) {
    warnings.push('El archivo CSV está vacío o no tiene el formato esperado.')
    return { metrics: defaultMetrics(), campaigns: [], warnings, rawRows: [] }
  }

  // Aggregate metrics across all rows (weighted avg by spend when possible)
  let totalSpend = 0
  const sums: Record<string, number> = { ctr_all: 0, ctr_unique: 0, roas: 0, frequency: 0, cpc: 0, cpa: 0, conv_rate: 0, engagement: 0, relevance: 0 }
  const counts: Record<string, number> = {}

  const campaigns: Campaign[] = []

  for (const row of rows) {
    const spend = num(findCol(row, 'spend'))
    totalSpend += spend

    for (const key of Object.keys(sums)) {
      const val = num(findCol(row, key))
      if (val > 0) {
        sums[key] = (sums[key] || 0) + val * (spend || 1)
        counts[key] = (counts[key] || 0) + (spend || 1)
      }
    }

    const name = findCol(row, 'campaign') || `Campaña ${campaigns.length + 1}`
    const roas = num(findCol(row, 'roas'))
    const ctr  = num(findCol(row, 'ctr_all'))
    const cpa  = num(findCol(row, 'cpa'))
    const budget = num(findCol(row, 'budget'))
    const conversions = Math.round(num(findCol(row, 'conversions')))

    campaigns.push({
      name,
      status: detectStatus(findCol(row, 'status')),
      budget: budget || Math.round(spend * 1.1),
      spend: Math.round(spend),
      roas,
      ctr,
      cpa,
      conversions,
      health: detectHealth(roas, ctr, cpa),
    })
  }

  const metrics: MetricValues = {
    ctr_all:    counts.ctr_all    ? sums.ctr_all    / counts.ctr_all    : 0,
    ctr_unique: counts.ctr_unique ? sums.ctr_unique / counts.ctr_unique : 0,
    roas:       counts.roas       ? sums.roas       / counts.roas       : 0,
    frequency:  counts.frequency  ? sums.frequency  / counts.frequency  : 0,
    cpc:        counts.cpc        ? sums.cpc        / counts.cpc        : 0,
    cpa:        counts.cpa        ? sums.cpa        / counts.cpa        : 0,
    conv_rate:  counts.conv_rate  ? sums.conv_rate  / counts.conv_rate  : 0,
    engagement: counts.engagement ? sums.engagement / counts.engagement : 0,
    relevance:  counts.relevance  ? sums.relevance  / counts.relevance  : 0,
  }

  // Warn about missing columns
  for (const [key, val] of Object.entries(metrics)) {
    if (val === 0) warnings.push(`No se encontró la columna "${key}" en el CSV — usando 0. Verifica el formato de exportación de Meta.`)
  }

  return { metrics, campaigns, warnings, rawRows: rows }
}

function defaultMetrics(): MetricValues {
  return { ctr_all: 0, ctr_unique: 0, roas: 0, frequency: 0, cpc: 0, cpa: 0, conv_rate: 0, engagement: 0, relevance: 0 }
}
