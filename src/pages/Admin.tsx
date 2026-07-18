import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const ADMIN_EMAIL = 'nexora981209@gmail.com'

type Plan = 'free' | 'starter' | 'pro' | 'agency'

interface Profile {
  id: string
  email: string
  plan: Plan
  created_at: string
}

const PLAN_COLORS: Record<Plan, string> = {
  free:    'text-white/30 bg-white/5 border-white/10',
  starter: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  pro:     'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  agency:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

const PLANS: Plan[] = ['free', 'starter', 'pro', 'agency']

export default function Admin() {
  const { user, loading: authLoading } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (isAdmin) fetchProfiles()
  }, [isAdmin])

  async function fetchProfiles() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setProfiles((data as Profile[]) ?? [])
    setLoading(false)
  }

  async function changePlan(userId: string, plan: Plan) {
    setUpdating(userId)
    const { error } = await supabase
      .from('profiles')
      .update({ plan })
      .eq('id', userId)
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, plan } : p))
      setToast(`Plan actualizado a ${plan}`)
      setTimeout(() => setToast(''), 2500)
    }
    setUpdating(null)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
        <div className="text-center">
          <p className="text-white text-[17px] font-semibold">Acceso restringido</p>
          <p className="text-white/40 text-[14px] mt-1">Debes iniciar sesión primero</p>
          <button onClick={() => window.location.href = '/'}
            className="mt-5 bg-white text-black text-[14px] font-semibold px-5 py-2.5 rounded-full">
            Ir al login
          </button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
        <div className="text-center">
          <p className="text-white text-[17px] font-semibold">Sin acceso</p>
          <p className="text-white/40 text-[14px] mt-1">Esta página es solo para administradores</p>
          <button onClick={() => window.location.href = '/'}
            className="mt-5 bg-white text-black text-[14px] font-semibold px-5 py-2.5 rounded-full">
            Volver
          </button>
        </div>
      </div>
    )
  }

  const filtered = profiles.filter(p =>
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total:   profiles.length,
    free:    profiles.filter(p => p.plan === 'free').length,
    starter: profiles.filter(p => p.plan === 'starter').length,
    pro:     profiles.filter(p => p.plan === 'pro').length,
    agency:  profiles.filter(p => p.plan === 'agency').length,
  }

  return (
    <div className="min-h-screen bg-black text-white"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1c1c1e] border border-white/10 text-white text-[13px] font-medium px-4 py-2.5 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <nav className="border-b border-white/[0.05] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="6" fill="#6366f1"/>
            <path d="M5 16L8.5 7L11 13L13.5 9L17 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <span className="text-white font-semibold text-[15px]">Metrixa</span>
            <span className="text-white/30 text-[13px] ml-2">Admin</span>
          </div>
        </div>
        <button onClick={() => window.location.href = '/'}
          className="text-white/30 text-[13px] hover:text-white/60 transition-colors">
          ← App
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Free', value: stats.free, color: 'text-white/40' },
            { label: 'Starter', value: stats.starter, color: 'text-blue-400' },
            { label: 'Pro+', value: stats.pro + stats.agency, color: 'text-indigo-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
              <p className={`text-[28px] font-bold leading-none ${s.color}`}>{s.value}</p>
              <p className="text-white/25 text-[12px] mt-1.5 font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + refresh */}
        <div className="flex gap-3">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por correo..."
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-white text-[14px] placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
          />
          <button onClick={fetchProfiles}
            className="bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] text-white/60 text-[13px] px-4 py-3 rounded-2xl transition-colors">
            Actualizar
          </button>
        </div>

        {/* Users list */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/25 text-[15px]">No hay usuarios todavía</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(profile => (
              <div key={profile.id}
                className="bg-white/[0.02] border border-white/[0.05] rounded-2xl px-4 py-4 flex items-center gap-4">

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-[13px] font-bold flex-shrink-0">
                  {profile.email?.[0]?.toUpperCase() ?? '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[14px] font-medium truncate">{profile.email}</p>
                  <p className="text-white/25 text-[12px] mt-0.5">
                    {new Date(profile.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Plan selector */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {PLANS.map(plan => (
                    <button
                      key={plan}
                      onClick={() => changePlan(profile.id, plan)}
                      disabled={updating === profile.id}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all capitalize disabled:opacity-40 ${
                        profile.plan === plan
                          ? PLAN_COLORS[plan]
                          : 'text-white/20 bg-transparent border-transparent hover:border-white/10 hover:text-white/40'
                      }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>

                {updating === profile.id && (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-white/15 text-[12px] pb-4">
          {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
