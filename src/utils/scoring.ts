import { METRICS } from '../data/mockData'
import type { MetricValues } from '../data/mockData'

export type MetricStatus = 'optimal' | 'warning' | 'critical'

export function getMetricStatus(key: string, value: number): MetricStatus {
  const cfg = METRICS.find((m) => m.key === key)!
  if (!cfg) return 'warning'

  if (cfg.higherIsBetter) {
    if (value >= cfg.idealMin) return 'optimal'
    if (value >= cfg.idealMin * 0.6) return 'warning'
    return 'critical'
  } else {
    const max = cfg.idealMax ?? cfg.idealMin
    if (value <= max) return 'optimal'
    if (value <= max * 1.5) return 'warning'
    return 'critical'
  }
}

export function getProgressPercent(key: string, value: number): number {
  const cfg = METRICS.find((m) => m.key === key)!
  if (!cfg) return 50

  if (cfg.higherIsBetter) {
    const target = cfg.idealMax ?? cfg.idealMin * 1.5
    return Math.min(100, (value / target) * 100)
  } else {
    const max = cfg.idealMax ?? cfg.idealMin
    if (value <= max) return 100
    const worst = max * 2.5
    return Math.max(0, ((worst - value) / (worst - max)) * 100)
  }
}

export function calculateHealthScore(metrics: MetricValues): number {
  const weights: Record<string, number> = {
    roas: 25,
    cpa: 20,
    conv_rate: 15,
    ctr_all: 10,
    ctr_unique: 8,
    cpc: 8,
    frequency: 6,
    engagement: 4,
    relevance: 4,
  }

  let score = 0
  let totalWeight = 0

  for (const [key, weight] of Object.entries(weights)) {
    const value = metrics[key as keyof MetricValues]
    const status = getMetricStatus(key, value)
    const points = status === 'optimal' ? 100 : status === 'warning' ? 55 : 15
    score += points * weight
    totalWeight += weight
  }

  return Math.round(score / totalWeight)
}

export interface Diagnosis {
  metric: string
  status: MetricStatus
  cause: string
  solution: string
  icon: string
}

export function generateDiagnosis(metrics: MetricValues): Diagnosis[] {
  const results: Diagnosis[] = []

  const checks: Array<{
    key: keyof MetricValues
    label: string
    icon: string
    warning: { cause: string; solution: string }
    critical: { cause: string; solution: string }
  }> = [
    {
      key: 'ctr_all',
      label: 'CTR General',
      icon: '🎯',
      warning: {
        cause: 'El CTR está por debajo del rango óptimo (2–3%), lo que indica que el copy o la imagen no están capturando la atención suficiente.',
        solution: 'Prueba creativos con propuestas de valor más directas, CTAs más fuertes y miniaturas de video con caras o emociones.',
      },
      critical: {
        cause: 'CTR muy bajo (<1%): la audiencia no está respondiendo al anuncio. Puede ser fatiga de anuncio o segmentación incorrecta.',
        solution: 'Rota creativos inmediatamente, revisa la segmentación y considera pausar los conjuntos de anuncios con frecuencia > 4.',
      },
    },
    {
      key: 'roas',
      label: 'ROAS',
      icon: '💰',
      warning: {
        cause: 'ROAS entre 2–3x: rentable pero por debajo del umbral ideal. El costo de adquisición está comiendo el margen.',
        solution: 'Optimiza la página de destino, sube el precio promedio del carrito con bundles o upsells, y reduce el CPC mejorando el Quality Score.',
      },
      critical: {
        cause: 'ROAS < 2x: estás perdiendo dinero en publicidad. La campaña no es viable en su estado actual.',
        solution: 'Pausa inmediatamente los conjuntos con ROAS < 1x. Revisa el funnel completo: tráfico frío vs. retargeting, y aumenta el presupuesto en lo que funciona.',
      },
    },
    {
      key: 'frequency',
      label: 'Frecuencia',
      icon: '🔁',
      warning: {
        cause: 'Frecuencia > 3: la audiencia está viendo el mismo anuncio demasiadas veces, lo que genera fatiga y banner blindness.',
        solution: 'Amplia la audiencia objetivo, agrega exclusiones de personas que ya convirtieron, y rota al menos 3–5 creativos distintos.',
      },
      critical: {
        cause: 'Frecuencia muy alta (>5): los usuarios ignoran o reportan el anuncio activamente. Daña el relevance score.',
        solution: 'Pausa los conjuntos afectados, resetea las audiencias y lanza creativos completamente nuevos con formato distinto (carrusel, video, etc.).',
      },
    },
    {
      key: 'cpc',
      label: 'CPC',
      icon: '💸',
      warning: {
        cause: 'CPC entre $0.50–$0.75: el costo por clic está por encima del benchmark. Reduce la competencia en subasta.',
        solution: 'Prueba estrategias de puja de menor coste, amplía audiencias para reducir overlap, y mejora el CTR para bajar el CPM efectivo.',
      },
      critical: {
        cause: 'CPC > $0.75: demasiado costoso para escalar. Indica baja relevancia o audiencias muy competidas.',
        solution: 'Revisa el Ad Relevance Diagnostics en Meta. Segmenta más específico o prueba audiencias LAL con seed de compradores reales.',
      },
    },
    {
      key: 'cpa',
      label: 'CPA',
      icon: '🎯',
      warning: {
        cause: 'CPA ligeramente sobre umbral: estás adquiriendo clientes pero al límite de rentabilidad.',
        solution: 'Optimiza el checkout, reduce la fricción en el formulario y aumenta el valor del pedido promedio con cross-sell.',
      },
      critical: {
        cause: 'CPA muy alto: cada conversión cuesta más de lo que aporta. La campaña es deficitaria.',
        solution: 'Segmenta solo hacia audiencias calientes (retargeting, LAL compradores), pausa prospección fría y revisa la tasa de conversión del landing.',
      },
    },
    {
      key: 'conv_rate',
      label: 'Tasa de Conversión',
      icon: '📊',
      warning: {
        cause: 'Tasa de conversión < 5%: hay pérdida en el funnel post-clic. El anuncio atrae clics pero la landing no convierte.',
        solution: 'Audita la landing: velocidad de carga (< 3s), propuesta de valor clara, CTA visible, prueba social y formulario simple.',
      },
      critical: {
        cause: 'Tasa de conversión < 2%: el funnel está roto. Hay una desconexión entre el mensaje del anuncio y la landing.',
        solution: 'Alinea el copy del anuncio con el headline de la landing (message match), implementa urgencia/escasez y testea variantes de landing con VWO o Google Optimize.',
      },
    },
    {
      key: 'relevance',
      label: 'Relevancia',
      icon: '⭐',
      warning: {
        cause: 'Score de relevancia 5–7: Meta está penalizando el delivery. El anuncio no resuena bien con la audiencia objetivo.',
        solution: 'Revisa el Ad Relevance Diagnostics. Trabaja en Quality Ranking, Engagement Rate Ranking y Conversion Rate Ranking por separado.',
      },
      critical: {
        cause: 'Relevancia < 5: Meta está limitando el alcance activamente. El algoritmo penaliza el anuncio con CPMs altos.',
        solution: 'Reconstruye el creativo desde cero. Usa UGC (contenido generado por usuarios), testimonios reales y formatos nativos de la plataforma.',
      },
    },
  ]

  for (const check of checks) {
    const value = metrics[check.key]
    const status = getMetricStatus(check.key, value)
    if (status !== 'optimal') {
      results.push({
        metric: check.label,
        status,
        cause: status === 'warning' ? check.warning.cause : check.critical.cause,
        solution: status === 'warning' ? check.warning.solution : check.critical.solution,
        icon: check.icon,
      })
    }
  }

  return results
}

export function getABVerdict(a: { ctr: number; roas: number; cpc: number; cpa: number; conv_rate: number }, b: typeof a) {
  let aWins = 0
  let bWins = 0
  const details: string[] = []

  if (a.roas > b.roas) { aWins += 3; details.push(`ROAS mayor (${a.roas}x vs ${b.roas}x)`) }
  else { bWins += 3; details.push(`ROAS mayor (${b.roas}x vs ${a.roas}x)`) }

  if (a.conv_rate > b.conv_rate) { aWins += 2; details.push(`Tasa conversión superior (${a.conv_rate}% vs ${b.conv_rate}%)`) }
  else { bWins += 2 }

  if (a.ctr > b.ctr) { aWins += 1; details.push(`CTR más alto (${a.ctr}% vs ${b.ctr}%)`) }
  else { bWins += 1 }

  if (a.cpa < b.cpa) { aWins += 2; details.push(`CPA más bajo ($${a.cpa} vs $${b.cpa})`) }
  else { bWins += 2 }

  if (a.cpc < b.cpc) { aWins += 1; details.push(`CPC más bajo ($${a.cpc} vs $${b.cpc})`) }
  else { bWins += 1 }

  const winner = aWins > bWins ? 'A' : 'B'
  const loser = winner === 'A' ? 'B' : 'A'
  const topReasons = details.slice(0, 3)

  return {
    winner,
    loser,
    aScore: aWins,
    bScore: bWins,
    reasons: topReasons,
    summary: `La Variante ${winner} supera a la Variante ${loser} en ${Math.abs(aWins - bWins)} puntos ponderados. Destacan: ${topReasons.join('; ')}.`,
  }
}
