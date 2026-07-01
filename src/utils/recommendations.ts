import type { MetricValues } from '../data/mockData'
import { getMetricStatus } from './scoring'

export interface Recommendation {
  priority: number
  impact: 'alto' | 'medio' | 'bajo'
  effort: 'fácil' | 'medio' | 'complejo'
  category: string
  action: string
  detail: string
  metric: string
  estimatedGain: string
}

export function generateRecommendations(metrics: MetricValues): Recommendation[] {
  const recs: Recommendation[] = []

  const roasStatus = getMetricStatus('roas', metrics.roas)
  const cpaStatus = getMetricStatus('cpa', metrics.cpa)
  const ctrStatus = getMetricStatus('ctr_all', metrics.ctr_all)
  const freqStatus = getMetricStatus('frequency', metrics.frequency)
  const convStatus = getMetricStatus('conv_rate', metrics.conv_rate)
  const relevanceStatus = getMetricStatus('relevance', metrics.relevance)
  const cpcStatus = getMetricStatus('cpc', metrics.cpc)

  if (roasStatus === 'critical') {
    recs.push({
      priority: 1,
      impact: 'alto',
      effort: 'medio',
      category: 'Rentabilidad',
      action: 'Pausar campañas con ROAS < 1x y redirigir presupuesto',
      detail: `Tu ROAS actual es ${metrics.roas.toFixed(2)}x. Identifica los conjuntos de anuncios con ROAS negativo, paúsalos y mueve ese presupuesto a los que están por encima de 2x. Cada dólar redirigido puede duplicar el retorno.`,
      metric: 'ROAS',
      estimatedGain: '+40–80% en ROAS total',
    })
  } else if (roasStatus === 'warning') {
    recs.push({
      priority: 2,
      impact: 'alto',
      effort: 'medio',
      category: 'Rentabilidad',
      action: 'Agregar upsell o bundle para subir el ticket promedio',
      detail: `Con ROAS de ${metrics.roas.toFixed(2)}x, el margen es ajustado. Aumentar el valor promedio del pedido en un 20% llevaría el ROAS a zona óptima sin tocar el costo de adquisición.`,
      metric: 'ROAS',
      estimatedGain: '+0.5–1x en ROAS',
    })
  }

  if (freqStatus !== 'optimal') {
    recs.push({
      priority: freqStatus === 'critical' ? 1 : 3,
      impact: 'alto',
      effort: 'fácil',
      category: 'Creativos',
      action: 'Rotar creativos: mínimo 3–5 variantes activas por conjunto',
      detail: `Frecuencia de ${metrics.frequency.toFixed(1)} significa que el usuario promedio ve el mismo anuncio demasiadas veces. Sube al menos 3 creativos nuevos (video corto, carrusel, imagen estática) y activa la rotación automática.`,
      metric: 'Frecuencia',
      estimatedGain: '-20–35% en CPC, +CTR',
    })
  }

  if (ctrStatus !== 'optimal') {
    recs.push({
      priority: ctrStatus === 'critical' ? 2 : 4,
      impact: 'alto',
      effort: 'fácil',
      category: 'Creativos',
      action: 'Reescribir el headline con propuesta de valor directa + número',
      detail: `CTR de ${metrics.ctr_all.toFixed(2)}% está bajo el benchmark (2–3%). Los anuncios con números específicos ("Ahorra $200 esta semana") y emociones en la primera línea tienen hasta 2x más CTR. Prueba 3 versiones de copy en paralelo.`,
      metric: 'CTR General',
      estimatedGain: '+0.5–1.5% en CTR',
    })
  }

  if (convStatus !== 'optimal') {
    recs.push({
      priority: convStatus === 'critical' ? 2 : 4,
      impact: 'alto',
      effort: 'complejo',
      category: 'Landing Page',
      action: 'Auditar y optimizar el funnel post-clic (landing page)',
      detail: `Tasa de conversión de ${metrics.conv_rate.toFixed(2)}% indica fuga post-clic. Revisa: velocidad de carga (debe ser <3s), headline alineado con el anuncio (message match), CTA visible above the fold, y formulario de máximo 3 campos.`,
      metric: 'Tasa de Conversión',
      estimatedGain: '+1–3% en conversión',
    })
  }

  if (cpaStatus !== 'optimal') {
    recs.push({
      priority: cpaStatus === 'critical' ? 2 : 5,
      impact: 'alto',
      effort: 'medio',
      category: 'Segmentación',
      action: 'Crear audiencia Lookalike 1–2% de compradores reales',
      detail: `CPA de $${metrics.cpa.toFixed(2)} se puede reducir significativamente apuntando a audiencias más calificadas. Sube una lista de compradores de los últimos 180 días y crea un LAL 1–2%. Estas audiencias convierten 3x mejor que intereses fríos.`,
      metric: 'CPA',
      estimatedGain: '-30–50% en CPA',
    })
  }

  if (relevanceStatus !== 'optimal') {
    recs.push({
      priority: 5,
      impact: 'medio',
      effort: 'medio',
      category: 'Relevancia',
      action: 'Mejorar Quality Ranking con UGC y testimonios reales',
      detail: `Score de relevancia ${metrics.relevance.toFixed(1)}/10 penaliza el delivery. Meta premia el contenido nativo y auténtico. Graba un testimonio real de cliente en vertical (9:16), sin producción excesiva. El UGC tiene 4x más engagement que creativos producidos.`,
      metric: 'Relevancia',
      estimatedGain: '+1–3 puntos en relevancia, -CPM',
    })
  }

  if (cpcStatus !== 'optimal') {
    recs.push({
      priority: 6,
      impact: 'medio',
      effort: 'fácil',
      category: 'Puja',
      action: 'Cambiar a estrategia "Coste más bajo" con límite de presupuesto diario',
      detail: `CPC de $${metrics.cpc.toFixed(2)} está sobre el benchmark ($0.50). Cambia la estrategia de puja a "Coste más bajo" y deja que el algoritmo optimice. En cuentas con >50 conversiones/semana, prueba "Coste objetivo" con CPA límite.`,
      metric: 'CPC',
      estimatedGain: '-15–30% en CPC',
    })
  }

  // Always add this if ROAS is not optimal
  if (roasStatus !== 'optimal') {
    recs.push({
      priority: 7,
      impact: 'medio',
      effort: 'fácil',
      category: 'Retargeting',
      action: 'Activar campaña de retargeting de visitantes últimos 30 días',
      detail: 'El retargeting convierte 2–5x mejor que prospección fría con un CPA mucho menor. Crea un conjunto que apunte a visitantes del sitio (últimos 30 días) excluyendo compradores, con presupuesto mínimo de $10/día.',
      metric: 'ROAS',
      estimatedGain: 'ROAS 3–5x en retargeting',
    })
  }

  return recs.sort((a, b) => a.priority - b.priority)
}
