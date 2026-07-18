import { useState } from 'react'
import { supabase } from '../lib/supabase'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$ 19 USD / mes',
    features: ['1 cuenta de Meta Ads', 'Reportes semanales', 'Envío WhatsApp a clientes', 'Dashboard completo'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$ 49 USD / mes',
    features: ['Hasta 5 cuentas Meta Ads', 'Todo lo de Starter', 'Análisis con IA', 'Exportar PDF'],
    highlight: true,
  },
  {
    id: 'agency',
    name: 'Agencia',
    price: '$ 99 USD / mes',
    features: ['Cuentas ilimitadas', 'Todo lo de Pro', 'Vista de cliente personalizada', 'Soporte prioritario'],
  },
]

export default function Paywall({ userEmail }: { userEmail: string }) {
  const [selected, setSelected] = useState('pro')
  const [sent, setSent] = useState(false)

  async function handleRequest() {
    // Sends a WhatsApp notification to the admin (optional — just shows confirmation for now)
    setSent(true)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-[#30d158]/10 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14l5.5 5.5L22 8" stroke="#30d158" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-white text-[20px] font-semibold">Solicitud enviada</p>
          <p className="text-white/40 text-[14px] mt-2 leading-relaxed">
            Cuando confirmemos tu pago activamos tu cuenta. Te avisamos al correo <span className="text-white/60">{userEmail}</span>
          </p>
          <p className="text-white/25 text-[13px] mt-6">¿Dudas? Escríbenos por WhatsApp</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>

      {/* Header */}
      <nav className="px-5 py-4 flex items-center justify-between border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="6" fill="#6366f1"/>
            <path d="M5 16L8.5 7L11 13L13.5 9L17 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white font-semibold text-[15px]">Metrixa</span>
        </div>
        <button onClick={handleSignOut} className="text-white/30 text-[13px] hover:text-white/50 transition-colors">
          Salir
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-12 text-center">

        <p className="text-indigo-400 text-[13px] font-semibold uppercase tracking-widest mb-3">Elige tu plan</p>
        <h1 className="text-white text-[28px] font-bold leading-tight mb-2">
          Activa tu cuenta
        </h1>
        <p className="text-white/40 text-[15px] mb-10">
          Paga por Nequi y en menos de 24 horas activamos tu acceso.
        </p>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`relative text-left rounded-2xl p-5 border transition-all ${
                selected === plan.id
                  ? plan.highlight
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/30 bg-white/[0.05]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Popular
                </span>
              )}
              <p className="text-white font-semibold text-[15px]">{plan.name}</p>
              <p className={`text-[13px] font-bold mt-1 mb-3 ${plan.highlight ? 'text-indigo-400' : 'text-white/60'}`}>
                {plan.price}
              </p>
              <ul className="space-y-1.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[12px] text-white/40">
                    <span className="text-[#30d158] mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Payment instructions */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 text-left mb-6">
          <p className="text-white font-semibold text-[15px] mb-4">Cómo pagar</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-[12px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <div>
                <p className="text-white/70 text-[13px]">Envía el pago por <strong className="text-white">Nequi</strong></p>
                <p className="text-white/40 text-[12px] mt-0.5">Número: <span className="text-white/70 font-mono">3XXXXXXXXX</span></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-[12px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <div>
                <p className="text-white/70 text-[13px]">Envía el comprobante por WhatsApp</p>
                <p className="text-white/40 text-[12px] mt-0.5">Con tu correo: <span className="text-white/70">{userEmail}</span></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-[12px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <p className="text-white/70 text-[13px]">Activamos tu cuenta en menos de 24 horas</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRequest}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[15px] py-3.5 rounded-2xl transition-colors"
        >
          Ya pagué — notificar al equipo
        </button>

        <p className="text-white/20 text-[12px] mt-4">
          Plan seleccionado: <span className="text-white/40 capitalize">{selected}</span> · {PLANS.find(p => p.id === selected)?.price}
        </p>
      </div>
    </div>
  )
}
