import type { AdVariant } from '../data/mockData'
import { getABVerdict } from '../utils/scoring'

interface Props {
  a: AdVariant
  b: AdVariant
}

function MetricRow({ label, a, b, format, lowerIsBetter }: { label: string; a: number; b: number; format: (v: number) => string; lowerIsBetter?: boolean }) {
  const aWins = lowerIsBetter ? a < b : a > b
  const bWins = lowerIsBetter ? b < a : b > a
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-gray-500 w-28 flex-shrink-0">{label}</span>
      <span className={`flex-1 text-center text-sm font-semibold rounded-lg py-1 ${aWins ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-400'}`}>{format(a)}</span>
      <span className={`flex-1 text-center text-sm font-semibold rounded-lg py-1 ${bWins ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-400'}`}>{format(b)}</span>
    </div>
  )
}

export default function ABComparator({ a, b }: Props) {
  const verdict = getABVerdict(a, b)

  return (
    <div className="bg-[#1a1b25] rounded-2xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-1">Comparador A/B</h3>
      <p className="text-sm text-gray-500 mb-5">Análisis ponderado por impacto de negocio</p>

      {/* Headers */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-28 flex-shrink-0" />
        <div className={`flex-1 text-center rounded-xl py-2 border ${verdict.winner === 'A' ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/5 bg-white/3'}`}>
          <p className="text-xs text-gray-500 mb-0.5">Variante</p>
          <p className="text-sm font-bold text-white">A</p>
          {verdict.winner === 'A' && <span className="text-xs text-blue-400">👑 Ganador</span>}
        </div>
        <div className={`flex-1 text-center rounded-xl py-2 border ${verdict.winner === 'B' ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/5 bg-white/3'}`}>
          <p className="text-xs text-gray-500 mb-0.5">Variante</p>
          <p className="text-sm font-bold text-white">B</p>
          {verdict.winner === 'B' && <span className="text-xs text-purple-400">👑 Ganador</span>}
        </div>
      </div>

      <MetricRow label="ROAS" a={a.roas} b={b.roas} format={(v) => v.toFixed(1) + 'x'} />
      <MetricRow label="CTR" a={a.ctr} b={b.ctr} format={(v) => v.toFixed(1) + '%'} />
      <MetricRow label="Conv. Rate" a={a.conv_rate} b={b.conv_rate} format={(v) => v.toFixed(1) + '%'} />
      <MetricRow label="CPA" a={a.cpa} b={b.cpa} format={(v) => '$' + v.toFixed(1)} lowerIsBetter />
      <MetricRow label="CPC" a={a.cpc} b={b.cpc} format={(v) => '$' + v.toFixed(2)} lowerIsBetter />
      <MetricRow label="Inversión" a={a.spend} b={b.spend} format={(v) => '$' + v} lowerIsBetter />
      <MetricRow label="Revenue" a={a.revenue} b={b.revenue} format={(v) => '$' + v} />

      {/* Verdict */}
      <div className={`mt-5 p-4 rounded-xl border ${verdict.winner === 'A' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-purple-500/10 border-purple-500/30'}`}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-lg">🏆</span>
          <span className="font-bold text-white text-sm">Veredicto: Variante {verdict.winner} gana</span>
          <span className="ml-auto text-xs text-gray-400">{verdict.aScore} vs {verdict.bScore} pts</span>
        </div>
        <p className="text-sm text-gray-300">{verdict.summary}</p>
      </div>
    </div>
  )
}
