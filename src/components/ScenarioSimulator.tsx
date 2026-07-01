import { useState } from 'react'
import type { MetricValues } from '../data/mockData'
import { calculateHealthScore } from '../utils/scoring'

interface Props {
  baseMetrics: MetricValues
}

interface Sliders {
  ctr_all: number
  conv_rate: number
  cpc: number
  frequency: number
  roas: number
}

export default function ScenarioSimulator({ baseMetrics }: Props) {
  const [deltas, setDeltas] = useState<Sliders>({
    ctr_all: 0,
    conv_rate: 0,
    cpc: 0,
    frequency: 0,
    roas: 0,
  })

  const simulated: MetricValues = {
    ...baseMetrics,
    ctr_all: Math.max(0, baseMetrics.ctr_all + deltas.ctr_all),
    conv_rate: Math.max(0, baseMetrics.conv_rate + deltas.conv_rate),
    cpc: Math.max(0.01, baseMetrics.cpc + deltas.cpc),
    frequency: Math.max(1, baseMetrics.frequency + deltas.frequency),
    roas: Math.max(0, baseMetrics.roas + deltas.roas),
    // Derived: CPA ≈ CPC / conv_rate * 100
    cpa: Math.max(0, (baseMetrics.cpc + deltas.cpc) / Math.max(0.01, (baseMetrics.conv_rate + deltas.conv_rate) / 100)),
  }

  const baseScore = calculateHealthScore(baseMetrics)
  const simScore = calculateHealthScore(simulated)
  const scoreDelta = simScore - baseScore

  function reset() {
    setDeltas({ ctr_all: 0, conv_rate: 0, cpc: 0, frequency: 0, roas: 0 })
  }

  const anyChanged = Object.values(deltas).some((v) => v !== 0)

  return (
    <div className="bg-[#1a1b25] rounded-2xl border border-white/5">
      <div className="p-6 pb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Simulador de Escenarios</h3>
          <p className="text-sm text-gray-500 mt-0.5">Ajusta métricas y ve cómo impacta el score y el CPA en tiempo real</p>
        </div>
        {anyChanged && (
          <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300 underline">
            Resetear
          </button>
        )}
      </div>

      <div className="px-6 pb-6 grid lg:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="space-y-5">
          <Slider
            label="CTR General"
            unit="%"
            base={baseMetrics.ctr_all}
            value={deltas.ctr_all}
            min={-2} max={3} step={0.1}
            onChange={(v) => setDeltas((d) => ({ ...d, ctr_all: v }))}
          />
          <Slider
            label="Tasa de Conversión"
            unit="%"
            base={baseMetrics.conv_rate}
            value={deltas.conv_rate}
            min={-3} max={8} step={0.1}
            onChange={(v) => setDeltas((d) => ({ ...d, conv_rate: v }))}
          />
          <Slider
            label="CPC"
            unit="$"
            base={baseMetrics.cpc}
            value={deltas.cpc}
            min={-0.5} max={0.5} step={0.01}
            onChange={(v) => setDeltas((d) => ({ ...d, cpc: v }))}
            invert
          />
          <Slider
            label="Frecuencia"
            unit=""
            base={baseMetrics.frequency}
            value={deltas.frequency}
            min={-3} max={3} step={0.1}
            onChange={(v) => setDeltas((d) => ({ ...d, frequency: v }))}
            invert
          />
          <Slider
            label="ROAS"
            unit="x"
            base={baseMetrics.roas}
            value={deltas.roas}
            min={-2} max={5} step={0.1}
            onChange={(v) => setDeltas((d) => ({ ...d, roas: v }))}
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Score comparison */}
          <div className="bg-[#13141e] rounded-xl p-4 border border-white/5">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">Score de Salud</p>
            <div className="flex items-center gap-4">
              <ScoreRing score={baseScore} label="Actual" />
              <div className="text-2xl text-gray-600">→</div>
              <ScoreRing score={simScore} label="Simulado" highlight />
            </div>
            <div className={`mt-3 text-center text-sm font-bold ${scoreDelta > 0 ? 'text-emerald-400' : scoreDelta < 0 ? 'text-red-400' : 'text-gray-500'}`}>
              {scoreDelta > 0 ? `+${scoreDelta} puntos` : scoreDelta < 0 ? `${scoreDelta} puntos` : 'Sin cambio'}
            </div>
          </div>

          {/* Metric comparison */}
          <div className="bg-[#13141e] rounded-xl p-4 border border-white/5 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Impacto en métricas clave</p>
            <MetricDiff label="CPA estimado" base={'$' + baseMetrics.cpa.toFixed(2)} sim={'$' + simulated.cpa.toFixed(2)} lower={simulated.cpa < baseMetrics.cpa} />
            <MetricDiff label="CTR" base={baseMetrics.ctr_all.toFixed(2) + '%'} sim={simulated.ctr_all.toFixed(2) + '%'} lower={simulated.ctr_all < baseMetrics.ctr_all} invert />
            <MetricDiff label="Conv. Rate" base={baseMetrics.conv_rate.toFixed(2) + '%'} sim={simulated.conv_rate.toFixed(2) + '%'} lower={simulated.conv_rate < baseMetrics.conv_rate} invert />
            <MetricDiff label="ROAS" base={baseMetrics.roas.toFixed(2) + 'x'} sim={simulated.roas.toFixed(2) + 'x'} lower={simulated.roas < baseMetrics.roas} invert />
          </div>

          {!anyChanged && (
            <p className="text-xs text-gray-600 text-center">Mueve los sliders para ver el impacto</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Slider({ label, unit, base, value, min, max, step, onChange, invert }: {
  label: string; unit: string; base: number; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; invert?: boolean
}) {
  const result = base + value
  const isPositive = invert ? value < 0 : value > 0
  const isNegative = invert ? value > 0 : value < 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">{unit}{base.toFixed(2)}</span>
          <span className="text-xs text-gray-500">→</span>
          <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-gray-400'}`}>
            {unit}{Math.max(0, result).toFixed(2)}
          </span>
          {value !== 0 && (
            <span className={`text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              ({value > 0 ? '+' : ''}{value.toFixed(2)})
            </span>
          )}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500"
        style={{ background: `linear-gradient(to right, #3B82F6 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%)` }}
      />
    </div>
  )
}

function ScoreRing({ score, label, highlight }: { score: number; label: string; highlight?: boolean }) {
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
  const size = 70
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 70 70" width={size} height={size} className="-rotate-90">
          <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${highlight ? 'text-white text-lg' : 'text-gray-400 text-base'}`}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  )
}

function MetricDiff({ label, base, sim, lower, invert }: { label: string; base: string; sim: string; lower: boolean; invert?: boolean }) {
  const improved = invert ? !lower : lower
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500">{base}</span>
        <span className="text-gray-600">→</span>
        <span className={`font-semibold ${base === sim ? 'text-gray-400' : improved ? 'text-emerald-400' : 'text-red-400'}`}>{sim}</span>
      </div>
    </div>
  )
}
