import { useState, useEffect } from 'react'
import type { MetricValues, Campaign } from '../data/mockData'

const META_APP_ID = import.meta.env.VITE_META_APP_ID as string | undefined

interface Props {
  onImport: (metrics: MetricValues, campaigns: Campaign[]) => void
}



async function fetchAdAccounts(token: string) {
  const res = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token=${token}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.data as { id: string; name: string; account_status: number }[]
}

async function fetchInsights(accountId: string, token: string) {
  const fields = 'campaign_name,spend,impressions,clicks,ctr,cpc,cpm,frequency,actions,action_values,cost_per_action_type'
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${accountId}/insights?fields=${fields}&date_preset=last_30d&level=campaign&access_token=${token}`
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.data as Record<string, string>[]
}

function parseInsights(rows: Record<string, string>[]): { metrics: MetricValues; campaigns: Campaign[] } {
  const num = (v: string | undefined) => parseFloat(v ?? '0') || 0

  let totalSpend = 0
  const sums: Record<string, number> = { ctr: 0, cpc: 0, frequency: 0, roas: 0, cpa: 0 }
  const counts: Record<string, number> = {}
  const campaigns: Campaign[] = []

  for (const row of rows) {
    const spend = num(row.spend)
    totalSpend += spend
    const ctr = num(row.ctr)
    const cpc = num(row.cpc)
    const freq = num(row.frequency)

    // ROAS from action_values
    let revenue = 0
    try {
      const av = JSON.parse(row.action_values ?? '[]') as { action_type: string; value: string }[]
      const purchase = av.find(a => a.action_type === 'purchase')
      if (purchase) revenue = num(purchase.value)
    } catch { /* no purchase data */ }
    const roas = spend > 0 && revenue > 0 ? revenue / spend : 0

    // CPA from cost_per_action_type
    let cpa = 0
    try {
      const cpa_arr = JSON.parse(row.cost_per_action_type ?? '[]') as { action_type: string; value: string }[]
      const purchase_cpa = cpa_arr.find(a => a.action_type === 'purchase')
      if (purchase_cpa) cpa = num(purchase_cpa.value)
    } catch { /* no cpa data */ }

    const weight = spend || 1
    if (ctr > 0)  { sums.ctr  += ctr  * weight; counts.ctr  = (counts.ctr  || 0) + weight }
    if (cpc > 0)  { sums.cpc  += cpc  * weight; counts.cpc  = (counts.cpc  || 0) + weight }
    if (freq > 0) { sums.frequency += freq * weight; counts.frequency = (counts.frequency || 0) + weight }
    if (roas > 0) { sums.roas += roas * weight; counts.roas = (counts.roas || 0) + weight }
    if (cpa > 0)  { sums.cpa  += cpa  * weight; counts.cpa  = (counts.cpa  || 0) + weight }

    const health = (roas < 2 || cpa > 25 || ctr < 0.8) ? 'critical' as const
      : (roas < 3 || cpa > 15 || ctr < 2) ? 'warning' as const
      : 'optimal' as const

    campaigns.push({
      name: row.campaign_name ?? `Campaña`,
      status: 'active',
      budget: Math.round(spend * 1.1),
      spend: Math.round(spend),
      roas,
      ctr,
      cpa,
      conversions: 0,
      health,
      objective: 'conversions',
      monthlyBudget: Math.round(spend * 1.1) * 30,
      daysElapsed: 15,
      daysTotal: 30,
      frequency: freq,
      ctrTrend: [ctr, ctr, ctr, ctr, ctr, ctr, ctr],
      impressions: num(row.impressions),
    })
  }

  const w = (key: string) => counts[key] ? sums[key] / counts[key] : 0

  const metrics: MetricValues = {
    ctr_all:    w('ctr'),
    ctr_unique: w('ctr') * 0.85,
    roas:       w('roas'),
    frequency:  w('frequency'),
    cpc:        w('cpc'),
    cpa:        w('cpa'),
    conv_rate:  w('roas') > 0 ? Math.min(w('ctr') * 0.3, 10) : 0,
    engagement: w('ctr') * 0.4,
    relevance:  w('roas') > 3 ? 8 : w('roas') > 2 ? 6 : 4,
  }

  return { metrics, campaigns }
}

export default function MetaConnect({ onImport }: Props) {
  const [step, setStep] = useState<'idle' | 'accounts' | 'loading' | 'done' | 'error'>('idle')
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])
  const [token, setToken] = useState('')
  const [manualToken, setManualToken] = useState('')
  const [error, setError] = useState('')
  const [loadingMsg, setLoadingMsg] = useState('')

  // Check if returning from OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('meta_connected') === '1') {
      const savedToken = sessionStorage.getItem('metrixa_meta_token')
      const savedAccountId = sessionStorage.getItem('metrixa_meta_account_id')
      if (savedToken && savedAccountId) {
        setToken(savedToken)
        handleSelectAccount(savedAccountId, savedToken)
        window.history.replaceState({}, '', '/')
      }
    }
  }, [])

  function handleOAuth() {
    if (!META_APP_ID) return
    const redirectUri = encodeURIComponent(`${window.location.origin}/meta-callback`)
    const scope = encodeURIComponent('ads_read,read_insights')
    const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token`
    window.location.href = url
  }


  async function handleTokenSubmit() {
    const t = manualToken.trim()
    if (!t) return
    setToken(t)
    setStep('accounts')
    setLoadingMsg('Buscando cuentas publicitarias...')
    try {
      const accs = await fetchAdAccounts(t)
      setAccounts(accs.filter(a => a.account_status === 1))
      setStep('accounts')
    } catch (e) {
      setError((e as Error).message)
      setStep('error')
    }
  }

  async function handleSelectAccount(accountId: string, overrideToken?: string) {
    setStep('loading')
    setLoadingMsg('Descargando métricas de los últimos 30 días...')
    const t = overrideToken ?? token
    try {
      const rows = await fetchInsights(accountId, t)
      const { metrics, campaigns } = parseInsights(rows)

      setStep('done')
      onImport(metrics, campaigns)
    } catch (e) {
      setError((e as Error).message)
      setStep('error')
    }
  }

  return (
    <div className="bg-[#1a1b25] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">📡</div>
        <div>
          <h3 className="text-white font-semibold">Conectar Meta Ads</h3>
          <p className="text-gray-500 text-xs">Importa métricas automáticamente — sin CSV</p>
        </div>
        <span className="ml-auto text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-1 rounded-full font-medium">PRO</span>
      </div>

      {step === 'idle' && (
        <div className="space-y-3">
          {/* OAuth button — preferred */}
          {META_APP_ID && (
            <button
              onClick={handleOAuth}
              className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Conectar con Facebook
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-gray-600">o con token manual</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="flex gap-2">
            <input
              type="password"
              value={manualToken}
              onChange={e => setManualToken(e.target.value)}
              placeholder="EAAxxxxx..."
              className="flex-1 bg-[#13141e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
            />
            <button
              onClick={handleTokenSubmit}
              disabled={!manualToken.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              Conectar
            </button>
          </div>
        </div>
      )}

      {step === 'accounts' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">Selecciona la cuenta publicitaria:</p>
          {accounts.length === 0 && <p className="text-gray-500 text-sm">No se encontraron cuentas activas.</p>}
          {accounts.map(acc => (
            <button
              key={acc.id}
              onClick={() => handleSelectAccount(acc.id)}
              className="w-full text-left bg-[#13141e] hover:bg-white/5 border border-white/10 hover:border-blue-500/30 rounded-xl px-4 py-3 transition-all"
            >
              <p className="text-white font-medium text-sm">{acc.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">{acc.id}</p>
            </button>
          ))}
        </div>
      )}

      {step === 'loading' && (
        <div className="text-center py-6">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{loadingMsg}</p>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-emerald-400 font-semibold">¡Métricas importadas!</p>
          <p className="text-emerald-400/60 text-xs mt-1">Datos de los últimos 30 días cargados automáticamente</p>
        </div>
      )}

      {step === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-semibold text-sm mb-1">Error de conexión</p>
          <p className="text-red-400/70 text-xs">{error}</p>
          <button onClick={() => { setStep('idle'); setError('') }} className="mt-3 text-xs text-gray-400 hover:text-white underline">
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  )
}
