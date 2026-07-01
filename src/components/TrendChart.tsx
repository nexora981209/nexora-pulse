import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { WEEKLY_TREND } from '../data/mockData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

export default function TrendChart() {
  const data = {
    labels: WEEKLY_TREND.labels,
    datasets: [
      {
        label: 'CTR General (%)',
        data: WEEKLY_TREND.ctr_all,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#3B82F6',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'ROAS (x)',
        data: WEEKLY_TREND.roas,
        borderColor: '#7C3AED',
        backgroundColor: 'rgba(124,58,237,0.08)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#7C3AED',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      },
      {
        label: 'Conv. Rate (%)',
        data: WEEKLY_TREND.conv_rate,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.05)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
        tension: 0.4,
        fill: false,
        yAxisID: 'y',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9ca3af',
          font: { size: 12 },
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#1f2035',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#9ca3af',
      },
    },
    scales: {
      x: {
        ticks: { color: '#6b7280', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        position: 'left' as const,
        ticks: { color: '#6b7280', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y1: {
        position: 'right' as const,
        ticks: { color: '#7C3AED', font: { size: 11 } },
        grid: { drawOnChartArea: false },
      },
    },
  }

  return (
    <div className="bg-[#1a1b25] rounded-2xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-1">Tendencia Semanal</h3>
      <p className="text-sm text-gray-500 mb-5">Últimos 7 días — CTR, ROAS y Tasa de Conversión</p>
      <div className="h-56">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
