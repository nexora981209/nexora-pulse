import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'signup' | 'forgot'

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleGoogle() {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?reset=1`,
      })
      setLoading(false)
      if (error) setError(error.message)
      else setSuccess('Revisa tu correo para restablecer la contraseña.')
      return
    }

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error) setError(error.message)
      else setSuccess('Cuenta creada. Revisa tu correo para confirmarla.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message)
  }

  const titles: Record<Mode, string> = {
    login:  'Bienvenido',
    signup: 'Crear cuenta',
    forgot: 'Recuperar acceso',
  }
  const subtitles: Record<Mode, string> = {
    login:  'Inicia sesión en Metrixa',
    signup: 'Empieza gratis, sin tarjeta',
    forgot: 'Te enviamos un enlace por correo',
  }
  const btnLabel: Record<Mode, string> = {
    login:  'Iniciar sesión',
    signup: 'Crear cuenta',
    forgot: 'Enviar enlace',
  }

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center justify-center px-5"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
    >
      {/* Logo */}
      <div className="mb-10 flex items-center gap-2.5">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect width="22" height="22" rx="6" fill="#6366f1"/>
          <path d="M5 16L8.5 7L11 13L13.5 9L17 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-white font-semibold text-[17px] tracking-tight">Metrixa</span>
      </div>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-white text-[28px] font-bold tracking-tight">{titles[mode]}</h1>
          <p className="text-white/40 text-[15px] mt-1.5">{subtitles[mode]}</p>
        </div>

        {/* Google button */}
        {mode !== 'forgot' && (
          <>
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 text-black text-[15px] font-semibold py-3.5 rounded-2xl transition-colors disabled:opacity-50 mb-5"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              )}
              Continuar con Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-white/25 text-[13px]">o con correo</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white text-[15px] placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
            />
          </div>
          {mode !== 'forgot' && (
            <div>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                minLength={6}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white text-[15px] placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
              />
            </div>
          )}

          {error && (
            <p className="text-[#ff453a] text-[13px] px-1">{error}</p>
          )}
          {success && (
            <p className="text-[#30d158] text-[13px] px-1">{success}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[15px] font-semibold py-3.5 rounded-2xl transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : btnLabel[mode]}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-2.5">
          {mode === 'login' && (
            <>
              <button onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}
                className="block w-full text-white/30 text-[13px] hover:text-white/60 transition-colors">
                Olvidé mi contraseña
              </button>
              <p className="text-white/25 text-[13px]">
                ¿No tienes cuenta?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Crear cuenta gratis
                </button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p className="text-white/25 text-[13px]">
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Iniciar sesión
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className="text-white/30 text-[13px] hover:text-white/60 transition-colors">
              ← Volver
            </button>
          )}
        </div>
      </div>

      <p className="mt-12 text-white/15 text-[12px]">
        Al continuar aceptas los{' '}
        <a href="/privacy" className="hover:text-white/30 transition-colors">términos de uso</a>
      </p>
    </div>
  )
}
