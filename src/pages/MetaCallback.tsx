import { useEffect, useState } from 'react'

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect width="22" height="22" rx="6" fill="#6366f1"/>
        <path d="M5 16L8.5 7L11 13L13.5 9L17 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-white font-semibold text-sm tracking-tight">Metrixa</span>
    </div>
  )
}

export default function MetaCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Conectando con Meta Ads...')

  useEffect(() => {
    async function handleCallback() {
      try {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const token = params.get('access_token')

        if (!token) {
          const urlParams = new URLSearchParams(window.location.search)
          const error = urlParams.get('error_description') ?? 'No se recibió el token de acceso'
          throw new Error(error)
        }

        setMessage('Obteniendo cuentas publicitarias...')

        const res = await fetch(
          `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token=${token}`
        )
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)

        const accounts = (data.data ?? []) as { id: string; name: string; account_status: number }[]
        const active = accounts.filter(a => a.account_status === 1)

        if (active.length === 0) throw new Error('No se encontraron cuentas publicitarias activas')

        const account = active[0]
        setMessage('Guardando conexión...')

        sessionStorage.setItem('metrixa_meta_token', token)
        sessionStorage.setItem('metrixa_meta_account_id', account.id)
        sessionStorage.setItem('metrixa_meta_account_name', account.name)

        window.history.replaceState(null, '', window.location.pathname)

        setStatus('success')
        setMessage(account.name)

        setTimeout(() => {
          window.location.href = '/?meta_connected=1'
        }, 2000)

      } catch (e) {
        setStatus('error')
        setMessage((e as Error).message)
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen bg-[#08080f] flex items-center justify-center px-5">
      <div className="w-full max-w-xs">
        <Logo />

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <p className="text-white text-sm font-medium">Conectando...</p>
                <p className="text-slate-500 text-xs mt-1">{message}</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 9l3.5 3.5L14 5.5" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Conectado</p>
                <p className="text-slate-400 text-xs mt-1">{message}</p>
                <p className="text-slate-600 text-xs mt-3">Redirigiendo a Metrixa...</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Error de conexión</p>
                <p className="text-red-400 text-xs mt-1">{message}</p>
              </div>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-2.5 rounded-xl transition-colors"
              >
                Volver a Metrixa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
