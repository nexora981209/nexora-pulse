import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function MetaCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Conectando con Meta Ads...')

  useEffect(() => {
    async function handleCallback() {
      try {
        // Meta returns token in URL hash: #access_token=xxx&...
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const token = params.get('access_token')

        if (!token) {
          // Check for error
          const urlParams = new URLSearchParams(window.location.search)
          const error = urlParams.get('error_description') ?? 'No se recibió el token de acceso'
          throw new Error(error)
        }

        setMessage('Obteniendo cuentas publicitarias...')

        // Get ad accounts
        const res = await fetch(
          `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token=${token}`
        )
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)

        const accounts = (data.data ?? []) as { id: string; name: string; account_status: number }[]
        const active = accounts.filter(a => a.account_status === 1)

        if (active.length === 0) throw new Error('No se encontraron cuentas publicitarias activas')

        // Save token to Supabase (use first active account)
        const account = active[0]
        setMessage('Guardando conexión...')

        await supabase.from('meta_tokens').upsert({
          client_id: null,
          access_token: token,
          ad_account_id: account.id,
          account_name: account.name,
        })

        // Store token in sessionStorage for the app to use
        sessionStorage.setItem('metrixa_meta_token', token)
        sessionStorage.setItem('metrixa_meta_account_id', account.id)
        sessionStorage.setItem('metrixa_meta_account_name', account.name)

        setStatus('success')
        setMessage(`¡Conectado con ${account.name}!`)

        // Redirect back to app after 2 seconds
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
    <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center px-5">
      <div className="bg-[#1a1b25] rounded-2xl border border-white/5 p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-5">
          M
        </div>

        {status === 'loading' && (
          <>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold mb-1">Conectando...</p>
            <p className="text-gray-500 text-sm">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <p className="text-4xl mb-3">✅</p>
            <p className="text-white font-bold text-lg mb-1">¡Conectado!</p>
            <p className="text-gray-400 text-sm">{message}</p>
            <p className="text-gray-600 text-xs mt-3">Redirigiendo a Metrixa...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="text-4xl mb-3">❌</p>
            <p className="text-white font-bold text-lg mb-1">Error de conexión</p>
            <p className="text-red-400 text-sm mb-4">{message}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              Volver a Metrixa
            </button>
          </>
        )}
      </div>
    </div>
  )
}
