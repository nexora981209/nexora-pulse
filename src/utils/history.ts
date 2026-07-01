import type { MetricValues, Campaign } from '../data/mockData'

export interface HistoryEntry {
  id: string
  date: string
  label: string
  score: number
  metrics: MetricValues
  campaigns: Campaign[]
  isRealData: boolean
}

const STORAGE_KEY = 'nexora-pulse-history'
const MAX_ENTRIES = 20

export function saveSnapshot(metrics: MetricValues, campaigns: Campaign[], score: number, isRealData: boolean): HistoryEntry {
  const entry: HistoryEntry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    label: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    score,
    metrics,
    campaigns,
    isRealData,
  }
  const existing = loadHistory()
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return entry
}

export function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function deleteEntry(id: string) {
  const updated = loadHistory().filter((e) => e.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
}
