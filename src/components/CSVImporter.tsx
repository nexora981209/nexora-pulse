import { useRef, useState } from 'react'
import { importMetaCSV } from '../utils/csvImport'
import type { MetricValues, Campaign } from '../data/mockData'

interface Props {
  onImport: (metrics: MetricValues, campaigns: Campaign[]) => void
  onReset: () => void
  isUsingRealData: boolean
}

export default function CSVImporter({ onImport, onReset, isUsingRealData }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)

  function processFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setWarnings(['El archivo debe ser .csv'])
      setShowModal(true)
      return
    }
    setLoading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const result = importMetaCSV(text)
      setLoading(false)
      if (result.warnings.length > 0) {
        setWarnings(result.warnings)
        setShowModal(true)
      }
      onImport(result.metrics, result.campaigns)
    }
    reader.readAsText(file, 'utf-8')
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  return (
    <>
      {/* Drop zone / trigger button */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
          dragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20 bg-white/2'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
        <div className="text-3xl mb-3">{loading ? '⏳' : '📂'}</div>
        <p className="text-white font-semibold text-sm mb-1">
          {loading ? 'Procesando CSV...' : 'Arrastra tu CSV de Meta Ads aquí'}
        </p>
        <p className="text-gray-500 text-xs">
          o haz clic para seleccionar el archivo · Exporta desde Meta Ads Manager → Informes → Descargar CSV
        </p>
        {isUsingRealData && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); onReset() }}
              className="text-xs text-gray-500 hover:text-gray-300 underline"
            >
              Volver a datos de demo
            </button>
          </div>
        )}
      </div>

      {/* Warnings modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1b25] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚠️</span>
              <h3 className="text-white font-semibold">Importación completada con advertencias</h3>
            </div>
            <div className="space-y-2 mb-5 max-h-60 overflow-y-auto">
              {warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">{w}</p>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Las columnas faltantes quedan en 0. Asegúrate de exportar desde Meta Ads con todas las métricas incluidas.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Entendido, ver análisis
            </button>
          </div>
        </div>
      )}
    </>
  )
}
