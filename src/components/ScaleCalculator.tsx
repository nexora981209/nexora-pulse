import { useState } from 'react'
import type { MetricValues } from '../data/mockData'

interface Props {
  metrics: MetricValues
}

export default function ScaleCalculator({ metrics }: Props) {
  const [currentBudget, setCurrentBudget] = useState(1500)
  const [currentRevenue, setCurrentRevenue] = useState(Math.round(1500 * metrics.roas))
  const [targetBudget, setTargetBudget] = useState(2000)
  const [margin, setMargin] = useState(40)

  const budgetIncreasePct = ((targetBudget - currentBudget) / currentBudget) * 100
  const currentRoas = currentRevenue / currentBudget
  const breakEvenRoas = 1 / (margin / 100)
  const projectedRevenue = targetBudget * currentRoas
  const projectedProfit = projectedRevenue * (margin / 100) - targetBudget
  const currentProfit = currentRevenue * (margin / 100) - currentBudget
  const profitDelta = projectedProfit - currentProfit

  // Min ROAS needed to break even at target budget
  const minRoasToBreakEven = breakEvenRoas
  const minRoasToMaintainProfit = (currentProfit + targetBudget) / (targetBudget * (margin / 100))
  const isSafeToScale = currentRoas >= minRoasToMaintainProfit * 1.1

  return (
    <div className="bg-[#1a1b25] rounded-2xl border border-white/5">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📈 Calculadora de Escala
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">¿Cuánto ROAS necesitas mantener para seguir siendo rentable al escalar?</p>
      </div>

      <div className="px-6 pb-6 grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <InputField
            label="Inversión actual (mes)"
            prefix="$"
            value={currentBudget}
            onChange={setCurrentBudget}
            min={100} max={100000} step={100}
          />
          <InputField
            label="Revenue actual (mes)"
            prefix="$"
            value={currentRevenue}
            onChange={setCurrentRevenue}
            min={100} max={500000} step={100}
          />
          <InputField
            label="Inversión objetivo (nuevo presupuesto)"
            prefix="$"
            value={targetBudget}
            onChange={setTargetBudget}
            min={100} max={200000} step={100}
          />
          <InputField
            label="Margen de ganancia del producto"
            suffix="%"
            value={margin}
            onChange={setMargin}
            min={5} max={95} step={1}
          />
        </div>

        {/* Results */}
        <div className="space-y-3">
          {/* Verdict */}
          <div className={`rounded-xl p-4 border text-center ${isSafeToScale ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <p className="text-2xl mb-1">{isSafeToScale ? '🚀' : '⚠️'}</p>
            <p className={`font-bold text-base ${isSafeToScale ? 'text-emerald-400' : 'text-red-400'}`}>
              {isSafeToScale ? 'Seguro escalar' : 'Riesgo al escalar'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isSafeToScale
                ? `Con +${budgetIncreasePct.toFixed(0)}% de presupuesto, tu ROAS actual (${currentRoas.toFixed(1)}x) cubre el umbral.`
                : `Necesitas mejorar el ROAS antes de escalar o reducirás tus ganancias.`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ResultCard label="ROAS actual" value={currentRoas.toFixed(2) + 'x'} sub="Base de cálculo" />
            <ResultCard label="ROAS mín. (break-even)" value={breakEvenRoas.toFixed(2) + 'x'} sub="Para no perder dinero" warn={currentRoas < breakEvenRoas} />
            <ResultCard label="ROAS mín. (mantener profit)" value={minRoasToMaintainProfit.toFixed(2) + 'x'} sub="Para igual ganancia" warn={currentRoas < minRoasToMaintainProfit} />
            <ResultCard label="Incremento presupuesto" value={`+${budgetIncreasePct.toFixed(0)}%`} sub={`$${currentBudget} → $${targetBudget}`} />
          </div>

          <div className="bg-[#13141e] rounded-xl p-4 border border-white/5 space-y-2">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Proyección con nuevo presupuesto</p>
            <Row label="Revenue proyectado" value={'$' + Math.round(projectedRevenue).toLocaleString()} positive />
            <Row label="Ganancia proyectada" value={'$' + Math.round(projectedProfit).toLocaleString()} positive={projectedProfit > 0} />
            <Row label="Delta vs. actual" value={(profitDelta >= 0 ? '+' : '') + '$' + Math.round(profitDelta).toLocaleString()} positive={profitDelta >= 0} />
          </div>
        </div>
      </div>
    </div>
  )
}

function InputField({ label, prefix, suffix, value, onChange, min, max, step }: {
  label: string; prefix?: string; suffix?: string
  value: number; onChange: (v: number) => void
  min: number; max: number; step: number
}) {
  return (
    <div>
      <label className="text-xs text-gray-400 block mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>}
          <input
            type="number" value={value}
            onChange={e => onChange(Number(e.target.value))}
            min={min} max={max} step={step}
            className={`w-full bg-[#13141e] border border-white/10 rounded-xl py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 ${prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-7' : 'px-3'}`}
          />
          {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{suffix}</span>}
        </div>
        <input
          type="range" value={value} min={min} max={max} step={step}
          onChange={e => onChange(Number(e.target.value))}
          className="w-24 accent-blue-500"
        />
      </div>
    </div>
  )
}

function ResultCard({ label, value, sub, warn }: { label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div className={`bg-[#13141e] rounded-xl p-3 border ${warn ? 'border-red-500/30' : 'border-white/5'}`}>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${warn ? 'text-red-400' : 'text-white'}`}>{value}</p>
      <p className="text-xs text-gray-600">{sub}</p>
    </div>
  )
}

function Row({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>{value}</span>
    </div>
  )
}
