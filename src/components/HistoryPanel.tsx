import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler,
} from 'chart.js'
import type { HistoryEntry } from '../utils/history'
import { deleteEntry, clearHistory } from '../utils/history'
import type { MetricValues, Campaign } from '../data/mockData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

interface Props {
  entries: HistoryEntry[]
  onLoad: (metrics: MetricValues, campaigns: Campaign[]) => void
  onRefresh: () => void
}

export default function HistoryPanel({ entries, onLoad, onRefresh }: Props) {
  const [confirmClear, setConfirmClear] = useState(false)

  function handleDelete(id: string) {
    deleteEntry(id)
    onRefresh()
  }

  function handleClear() {
    clearHistory()
    setConfirmClear(false)
    onRefresh()
  }

  const chartLabels = [...entries].reverse().map((e) =>
    new Date(e.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  )
  const chartScores = [...entries].reverse().map((e) => e.score)

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Score de Salud',
      data: chartScores,
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59,130,246,0.08)',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: chartScores.map(s => s >= 70 ? '#10b981' : s >= 45 ? '#f59e0b' : '#ef4444'),
      tension: 0.4,
      fill: true,
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2035',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#9ca3af',
      },
    },
    scales: {
      x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { min: 0, max: 100, ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  }

  return (
    <div className="bg-[#1a1b25] rounded-2xl border border-white/5">
      <div className="p-6 pb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Histórico de Reportes</h3>
          <p className="text-sm text-gray-500 mt-0.5">Evolución del score semana a semana · {entries.length} snapshots guardados</p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="px-6 pb-6 text-center py-8">
          <p className="text-3xl mb-3">📁</p>
          <p className="text-gray-400 font-medium text-sm">Sin historial todavía</p>
          <p className="text-gray-600 text-xs mt-1">Guarda un snapshot para comenzar a rastrear la evolución</p>
        </div>
      ) : (
        <div className="px-6 pb-6 space-y-5">
          {/* Evolution chart */}
          {entries.length >= 2 && (
            <div className="h-36">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}

          {/* Entries list */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {entries.map((e, i) => {
              const prev = entries[i + 1]
              const delta = prev ? e.score - prev.score : null
              const scoreColor = e.score >= 70 ? 'text-emerald-400' : e.score >= 45 ? 'text-amber-400' : 'text-red-400'

              return (
                <div key={e.id} className="bg-[#13141e] rounded-xl p-3.5 border border-white/5 flex items-center gap-3">
                  <div className="flex-shrink-0 text-center w-12">
                    <p className={`text-xl font-bold ${scoreColor}`}>{e.score}</p>
                    <p className="text-xs text-gray-600">/100</p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-300 font-medium">{e.label}</p>
                      {e.isRealData && (
                        <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">real</span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-600">
                      <span>ROAS {e.metrics.roas.toFixed(1)}x</span>
                      <span>CTR {e.metrics.ctr_all.toFixed(1)}%</span>
                      <span>CPA ${e.metrics.cpa.toFixed(0)}</span>
                    </div>
                  </div>

                  {delta !== null && (
                    <span className={`text-xs font-bold flex-shrink-0 ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                      {delta > 0 ? `▲ +${delta}` : delta < 0 ? `▼ ${delta}` : '— igual'}
                    </span>
                  )}

                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => onLoad(e.metrics, e.campaigns)}
                      className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-lg transition-colors"
                    >
                      Cargar
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-xs text-gray-600 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Confirm clear modal */}
      {confirmClear && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1b25] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-white font-semibold mb-2">¿Limpiar historial?</h3>
            <p className="text-gray-500 text-sm mb-5">Se eliminarán todos los snapshots guardados. Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmClear(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-sm py-2 rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleClear} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded-xl transition-colors">Eliminar todo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
