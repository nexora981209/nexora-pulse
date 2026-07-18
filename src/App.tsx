import { useState, useEffect } from 'react'
import { CURRENT_METRICS, METRICS, AD_VARIANTS, CAMPAIGNS } from './data/mockData'
import type { MetricValues, Campaign } from './data/mockData'
import { calculateHealthScore, generateDiagnosis } from './utils/scoring'
import { exportMetricsCSV, exportCampaignsCSV } from './utils/csvExport'
import { generatePDF } from './utils/pdfExport'
import { generateRecommendations } from './utils/recommendations'
import { saveSnapshot, loadHistory } from './utils/history'
import type { HistoryEntry } from './utils/history'
import KPICard from './components/KPICard'
import HealthScore from './components/HealthScore'
import DiagnosticPanel from './components/DiagnosticPanel'
import ABComparator from './components/ABComparator'
import CampaignTable from './components/CampaignTable'
import TrendChart from './components/TrendChart'
import CSVImporter from './components/CSVImporter'
import RecommendationsPanel from './components/RecommendationsPanel'
import ScenarioSimulator from './components/ScenarioSimulator'
import HistoryPanel from './components/HistoryPanel'
import ClientView from './components/ClientView'
import CreativeFatigue from './components/CreativeFatigue'
import BudgetPacing from './components/BudgetPacing'
import ObjectiveAnalysis from './components/ObjectiveAnalysis'
import ScaleCalculator from './components/ScaleCalculator'
import WhatsAppReport from './components/WhatsAppReport'
import Onboarding from './components/Onboarding'
import ProgressGuide from './components/ProgressGuide'
import MetaConnect from './components/MetaConnect'
import { useAuth } from './hooks/useAuth'

const ONBOARDING_KEY = 'metrixa-onboarding-done'

export default function App() {
  const { user, plan, signOut } = useAuth()
  const [metrics, setMetrics] = useState<MetricValues>(CURRENT_METRICS)
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS)
  const [isRealData, setIsRealData] = useState(false)
  const [showImporter, setShowImporter] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Progress tracking
  const [hasViewedAlerts, setHasViewedAlerts] = useState(false)
  const [hasDownloaded, setHasDownloaded] = useState(false)

  const healthScore = calculateHealthScore(metrics)
  const diagnoses = generateDiagnosis(metrics)
  const recommendations = generateRecommendations(metrics)

  useEffect(() => {
    setHistory(loadHistory())
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (!done) setShowOnboarding(true)
  }, [])

  function handleOnboardingStart() {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setShowOnboarding(false)
    setShowImporter(true)
  }

  function refreshHistory() { setHistory(loadHistory()) }

  function handleImport(m: MetricValues, c: Campaign[]) {
    setMetrics(m)
    setCampaigns(c)
    setIsRealData(true)
    setShowImporter(false)
  }

  function handleReset() {
    setMetrics(CURRENT_METRICS)
    setCampaigns(CAMPAIGNS)
    setIsRealData(false)
    setShowImporter(false)
  }

  async function handlePDF() {
    setPdfLoading(true)
    await generatePDF(metrics, campaigns, isRealData)
    setPdfLoading(false)
    setHasDownloaded(true)
  }

  function handleSaveSnapshot() {
    saveSnapshot(metrics, campaigns, healthScore, isRealData)
    refreshHistory()
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2500)
  }

  function handleLoadSnapshot(m: MetricValues, c: Campaign[]) {
    setMetrics(m)
    if (c.length > 0) setCampaigns(c)
    setIsRealData(true)
  }

  // Onboarding screen
  if (showOnboarding) {
    return <Onboarding onStart={handleOnboardingStart} />
  }

  // Client view (default) — simplified, friendly
  if (!showAdvanced) {
    return (
      <ClientView
        metrics={metrics}
        campaigns={campaigns}
        isRealData={isRealData}
        onUploadCSV={() => {
          setShowAdvanced(true)
          setShowImporter(true)
        }}
        onAdvancedView={() => setShowAdvanced(true)}
        onDownloaded={() => setHasDownloaded(true)}
      />
    )
  }

  // Advanced / technical dashboard
  return (
    <div className="min-h-screen bg-[#08080f]">
      {savedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl">
          Snapshot guardado
        </div>
      )}

      <header className="border-b border-white/[0.06] bg-[#08080f]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect width="22" height="22" rx="6" fill="#6366f1"/>
              <path d="M5 16L8.5 7L11 13L13.5 9L17 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h1 className="text-white font-semibold text-sm leading-none tracking-tight">Metrixa</h1>
              <p className="text-slate-600 text-[10px] mt-0.5">Vista avanzada</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isRealData
              ? <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-medium">Datos reales</span>
              : <span className="text-[10px] text-slate-500 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">Demo</span>
            }
            <button onClick={() => setShowImporter(v => !v)}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
              Importar CSV
            </button>
            <div className="relative">
              <button onClick={e => { e.stopPropagation(); setShowExportMenu(v => !v) }}
                className="text-xs text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/20 bg-white/[0.03] px-3 py-1.5 rounded-lg font-medium transition-colors">
                Exportar CSV
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-9 bg-[#13131f] border border-white/10 rounded-xl shadow-2xl py-1.5 w-44 z-20">
                  <button onClick={() => { exportMetricsCSV(metrics, healthScore); setShowExportMenu(false) }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-white/[0.04] transition-colors">
                    Métricas KPI
                  </button>
                  <button onClick={() => { exportCampaignsCSV(campaigns); setShowExportMenu(false) }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-white/[0.04] transition-colors">
                    Tabla de campañas
                  </button>
                  <div className="h-px bg-white/[0.05] mx-2 my-1" />
                  <button onClick={() => { exportMetricsCSV(metrics, healthScore); setTimeout(() => exportCampaignsCSV(campaigns), 300); setShowExportMenu(false) }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-white/[0.04] transition-colors">
                    Todo junto
                  </button>
                </div>
              )}
            </div>
            <button onClick={handlePDF} disabled={pdfLoading}
              className="text-xs text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/20 bg-white/[0.03] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
              {pdfLoading ? 'Generando...' : 'PDF'}
            </button>
            <button onClick={handleSaveSnapshot}
              className="text-xs text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/20 bg-white/[0.03] px-3 py-1.5 rounded-lg transition-colors">
              Snapshot
            </button>
            <button onClick={() => setShowAdvanced(false)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors pl-1">
              ← Cliente
            </button>
            <div className="w-px h-4 bg-white/[0.08]" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {user?.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <span className="text-[10px] text-slate-600 hidden sm:block">{plan}</span>
              <button onClick={signOut} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8" onClick={() => { if (showExportMenu) setShowExportMenu(false) }}>

        {/* Progress guide */}
        <ProgressGuide hasData={isRealData} hasViewedAlerts={hasViewedAlerts} hasDownloaded={hasDownloaded} />

        {/* Meta Ads direct connection */}
        <MetaConnect onImport={handleImport} />

        {showImporter && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-white font-semibold text-base">Importar datos reales de Meta Ads</h2>
                <p className="text-gray-500 text-xs mt-0.5">El dashboard se recalcula automáticamente con tus datos</p>
              </div>
              <button onClick={() => setShowImporter(false)} className="text-gray-500 hover:text-gray-300 text-2xl leading-none">×</button>
            </div>
            <CSVImporter onImport={handleImport} onReset={handleReset} isUsingRealData={isRealData} />
            <div className="mt-3 bg-[#1a1b25] rounded-xl p-4 border border-white/5">
              <p className="text-xs text-gray-400 font-medium mb-2">¿Cómo exportar el CSV desde Meta Ads?</p>
              <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                <li>Abre <strong className="text-gray-400">Meta Ads Manager</strong></li>
                <li>Ve a <strong className="text-gray-400">Informes → Informes personalizados</strong></li>
                <li>Selecciona el rango de fechas y las campañas</li>
                <li>Haz clic en <strong className="text-gray-400">Exportar → CSV</strong></li>
                <li>Sube el archivo aquí y el análisis corre automáticamente</li>
              </ol>
            </div>
          </section>
        )}

        {/* 1. Health Score */}
        <HealthScore score={healthScore} />

        {/* 2. KPI Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-base">Métricas KPI</h2>
            <span className="text-xs text-gray-500">{diagnoses.filter(d => d.status === 'critical').length} críticas · {diagnoses.filter(d => d.status === 'warning').length} alertas</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {METRICS.map((m) => (
              <KPICard key={m.key} config={m} value={metrics[m.key as keyof MetricValues]} />
            ))}
          </div>
        </section>

        {/* 3. Trend Chart */}
        <TrendChart />

        {/* 4. Creative Fatigue + Budget Pacing */}
        <div className="grid lg:grid-cols-2 gap-6">
          <CreativeFatigue campaigns={campaigns} />
          <BudgetPacing campaigns={campaigns} />
        </div>

        {/* 5. Objective Analysis */}
        <ObjectiveAnalysis campaigns={campaigns} />

        {/* 6. Recommendations */}
        <RecommendationsPanel recommendations={recommendations} />

        {/* 7. Scenario Simulator + Scale Calculator */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ScenarioSimulator baseMetrics={metrics} />
          <ScaleCalculator metrics={metrics} />
        </div>

        {/* 8. WhatsApp Report */}
        <WhatsAppReport metrics={metrics} campaigns={campaigns} />

        {/* 9. Diagnostic + AB */}
        <div className="grid lg:grid-cols-2 gap-6" onClick={() => setHasViewedAlerts(true)}>
          <DiagnosticPanel diagnoses={diagnoses} />
          <ABComparator a={AD_VARIANTS[0]} b={AD_VARIANTS[1]} />
        </div>

        {/* 10. Campaign Table */}
        <CampaignTable campaigns={campaigns} />

        {/* 11. History */}
        <HistoryPanel entries={history} onLoad={handleLoadSnapshot} onRefresh={refreshHistory} />

        <footer className="text-center text-xs text-gray-600 py-4">
          Metrixa · {isRealData ? 'Datos importados desde Meta Ads' : 'Datos simulados'} · {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  )
}
