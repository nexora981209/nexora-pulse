import type { Recommendation } from '../utils/recommendations'

interface Props {
  recommendations: Recommendation[]
}

const impactColor = { alto: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', medio: 'text-amber-400 bg-amber-500/10 border-amber-500/30', bajo: 'text-gray-400 bg-gray-500/10 border-gray-500/30' }
const effortColor = { fácil: 'text-blue-400 bg-blue-500/10 border-blue-500/30', medio: 'text-purple-400 bg-purple-500/10 border-purple-500/30', complejo: 'text-red-400 bg-red-500/10 border-red-500/30' }
const priorityGradient = ['from-red-500 to-red-600', 'from-orange-500 to-orange-600', 'from-amber-500 to-amber-600', 'from-blue-500 to-blue-600', 'from-purple-500 to-purple-600']

export default function RecommendationsPanel({ recommendations }: Props) {
  return (
    <div className="bg-[#1a1b25] rounded-2xl border border-white/5">
      <div className="p-6 pb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Recomendaciones Priorizadas</h3>
          <p className="text-sm text-gray-500 mt-0.5">Ordenadas por impacto en negocio · Haz la #1 primero</p>
        </div>
        <span className="text-xs bg-white/5 text-gray-400 border border-white/10 px-2.5 py-1 rounded-full">
          {recommendations.length} acciones
        </span>
      </div>

      <div className="px-6 pb-6 space-y-3">
        {recommendations.map((r, i) => (
          <div key={i} className="bg-[#13141e] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-start gap-3">
              {/* Priority number */}
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${priorityGradient[Math.min(i, 4)]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                {i + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{r.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${impactColor[r.impact]}`}>
                    Impacto {r.impact}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${effortColor[r.effort]}`}>
                    Esfuerzo {r.effort}
                  </span>
                  <span className="ml-auto text-xs text-emerald-400 font-medium">{r.estimatedGain}</span>
                </div>

                <p className="text-white font-semibold text-sm mb-1">{r.action}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{r.detail}</p>
              </div>
            </div>
          </div>
        ))}

        {recommendations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-emerald-400 font-medium">Todo en orden</p>
            <p className="text-gray-500 text-sm">No hay recomendaciones pendientes. ¡Sigue escalando!</p>
          </div>
        )}
      </div>
    </div>
  )
}
