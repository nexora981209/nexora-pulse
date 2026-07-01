export interface MetricConfig {
  key: string
  label: string
  unit: string
  idealLabel: string
  idealMin: number
  idealMax: number | null
  higherIsBetter: boolean
  format: (v: number) => string
}

export const METRICS: MetricConfig[] = [
  { key: 'ctr_all', label: 'CTR General', unit: '%', idealLabel: '2% – 3%', idealMin: 2, idealMax: 3, higherIsBetter: true, format: (v) => v.toFixed(2) + '%' },
  { key: 'ctr_unique', label: 'CTR Único', unit: '%', idealLabel: '> 1%', idealMin: 1, idealMax: null, higherIsBetter: true, format: (v) => v.toFixed(2) + '%' },
  { key: 'roas', label: 'ROAS', unit: 'x', idealLabel: '≥ 3x', idealMin: 3, idealMax: null, higherIsBetter: true, format: (v) => v.toFixed(2) + 'x' },
  { key: 'frequency', label: 'Frecuencia', unit: '', idealLabel: '1 – 3', idealMin: 1, idealMax: 3, higherIsBetter: false, format: (v) => v.toFixed(1) },
  { key: 'cpc', label: 'CPC', unit: '$', idealLabel: '< $0.50', idealMin: 0, idealMax: 0.5, higherIsBetter: false, format: (v) => '$' + v.toFixed(2) },
  { key: 'cpa', label: 'CPA', unit: '$', idealLabel: '< $15', idealMin: 0, idealMax: 15, higherIsBetter: false, format: (v) => '$' + v.toFixed(2) },
  { key: 'conv_rate', label: 'Tasa Conversión', unit: '%', idealLabel: '≥ 5%', idealMin: 5, idealMax: null, higherIsBetter: true, format: (v) => v.toFixed(2) + '%' },
  { key: 'engagement', label: 'Engagement', unit: '%', idealLabel: '1% – 2%', idealMin: 1, idealMax: 2, higherIsBetter: false, format: (v) => v.toFixed(2) + '%' },
  { key: 'relevance', label: 'Relevancia', unit: '', idealLabel: '≥ 7', idealMin: 7, idealMax: 10, higherIsBetter: true, format: (v) => v.toFixed(1) + ' / 10' },
]

export interface MetricValues {
  ctr_all: number
  ctr_unique: number
  roas: number
  frequency: number
  cpc: number
  cpa: number
  conv_rate: number
  engagement: number
  relevance: number
}

export const CURRENT_METRICS: MetricValues = {
  ctr_all: 1.4,
  ctr_unique: 0.8,
  roas: 2.1,
  frequency: 4.2,
  cpc: 0.72,
  cpa: 22.5,
  conv_rate: 3.8,
  engagement: 0.6,
  relevance: 5.5,
}

export const WEEKLY_TREND = {
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  ctr_all: [1.1, 1.3, 1.5, 1.4, 1.6, 1.2, 1.4],
  roas: [1.8, 2.0, 2.3, 2.1, 2.5, 1.9, 2.1],
  conv_rate: [3.2, 3.5, 4.0, 3.8, 4.2, 3.6, 3.8],
}

export interface AdVariant {
  name: string
  ctr: number
  roas: number
  cpc: number
  cpa: number
  conv_rate: number
  impressions: number
  clicks: number
  spend: number
  revenue: number
}

export const AD_VARIANTS: [AdVariant, AdVariant] = [
  { name: 'Variante A — "Oferta Flash"', ctr: 2.1, roas: 3.4, cpc: 0.42, cpa: 12.8, conv_rate: 5.2, impressions: 48200, clicks: 1012, spend: 425, revenue: 1445 },
  { name: 'Variante B — "Testimonio"', ctr: 1.3, roas: 1.9, cpc: 0.68, cpa: 24.5, conv_rate: 2.8, impressions: 45600, clicks: 593, spend: 403, revenue: 765 },
]

export type CampaignObjective = 'conversions' | 'traffic' | 'awareness' | 'engagement' | 'leads'

export interface Campaign {
  name: string
  status: 'active' | 'paused' | 'ended'
  budget: number
  spend: number
  roas: number
  ctr: number
  cpa: number
  conversions: number
  health: 'optimal' | 'warning' | 'critical'
  objective: CampaignObjective
  monthlyBudget: number
  daysElapsed: number
  daysTotal: number
  frequency: number
  ctrTrend: number[]
  impressions: number
}

export const CAMPAIGNS: Campaign[] = [
  {
    name: 'Retargeting — Carrito Abandonado',
    status: 'active', budget: 300, spend: 287, roas: 4.2, ctr: 2.8, cpa: 9.5, conversions: 30,
    health: 'optimal', objective: 'conversions', monthlyBudget: 9000, daysElapsed: 18, daysTotal: 30,
    frequency: 2.1, ctrTrend: [3.1, 3.0, 2.9, 2.8, 2.7, 2.8, 2.8], impressions: 48200,
  },
  {
    name: 'Prospección — Intereses Frío',
    status: 'active', budget: 500, spend: 492, roas: 1.8, ctr: 1.1, cpa: 28.0, conversions: 17,
    health: 'critical', objective: 'conversions', monthlyBudget: 15000, daysElapsed: 18, daysTotal: 30,
    frequency: 5.8, ctrTrend: [2.1, 1.9, 1.6, 1.4, 1.2, 1.1, 1.1], impressions: 62000,
  },
  {
    name: 'Lookalike 2% — Compradores',
    status: 'active', budget: 400, spend: 376, roas: 3.1, ctr: 2.2, cpa: 14.2, conversions: 26,
    health: 'optimal', objective: 'conversions', monthlyBudget: 12000, daysElapsed: 18, daysTotal: 30,
    frequency: 2.9, ctrTrend: [2.4, 2.3, 2.3, 2.2, 2.2, 2.2, 2.2], impressions: 55000,
  },
  {
    name: 'Brand Awareness — Video',
    status: 'paused', budget: 200, spend: 145, roas: 0.9, ctr: 0.7, cpa: 45.0, conversions: 3,
    health: 'critical', objective: 'awareness', monthlyBudget: 6000, daysElapsed: 18, daysTotal: 30,
    frequency: 6.5, ctrTrend: [1.2, 1.0, 0.9, 0.8, 0.7, 0.7, 0.7], impressions: 38000,
  },
  {
    name: 'DPA — Catálogo Dinámico',
    status: 'active', budget: 350, spend: 310, roas: 2.7, ctr: 1.9, cpa: 17.5, conversions: 17,
    health: 'warning', objective: 'conversions', monthlyBudget: 10500, daysElapsed: 18, daysTotal: 30,
    frequency: 3.4, ctrTrend: [2.2, 2.1, 2.0, 2.0, 1.9, 1.9, 1.9], impressions: 41000,
  },
  {
    name: 'Engagement — Publicaciones',
    status: 'active', budget: 150, spend: 138, roas: 2.1, ctr: 1.6, cpa: 20.0, conversions: 7,
    health: 'warning', objective: 'engagement', monthlyBudget: 4500, daysElapsed: 18, daysTotal: 30,
    frequency: 3.1, ctrTrend: [1.8, 1.7, 1.7, 1.6, 1.6, 1.6, 1.6], impressions: 29000,
  },
  {
    name: 'Leads — Formulario Nativo',
    status: 'active', budget: 250, spend: 180, roas: 0, ctr: 2.4, cpa: 8.2, conversions: 22,
    health: 'optimal', objective: 'leads', monthlyBudget: 7500, daysElapsed: 18, daysTotal: 30,
    frequency: 2.3, ctrTrend: [2.5, 2.5, 2.4, 2.4, 2.4, 2.4, 2.4], impressions: 33000,
  },
  {
    name: 'Tráfico — Blog y Contenido',
    status: 'active', budget: 100, spend: 88, roas: 0, ctr: 3.1, cpa: 0.8, conversions: 110,
    health: 'optimal', objective: 'traffic', monthlyBudget: 3000, daysElapsed: 18, daysTotal: 30,
    frequency: 1.8, ctrTrend: [3.0, 3.1, 3.2, 3.1, 3.1, 3.1, 3.1], impressions: 18000,
  },
]
