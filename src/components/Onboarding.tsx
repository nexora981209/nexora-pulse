interface Props {
  onStart: () => void
}

export default function Onboarding({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a10] flex flex-col items-center justify-center px-5 text-center">
      {/* Logo */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-2xl shadow-blue-500/30">
        N
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Nexora Pulse</h1>
      <p className="text-gray-400 text-base mb-10 max-w-sm">
        Analiza tus anuncios de Meta en segundos — sin ser experto en marketing
      </p>

      {/* Steps */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-2xl w-full">
        {[
          { icon: '📥', step: '1', title: 'Sube tu archivo', desc: 'Exporta el CSV desde Meta Ads Manager y súbelo aquí' },
          { icon: '🔍', step: '2', title: 'Análisis automático', desc: 'Revisamos todas tus métricas y detectamos problemas' },
          { icon: '📋', step: '3', title: 'Recibe tu reporte', desc: 'Descarga el PDF o copia el resumen para WhatsApp' },
        ].map((s) => (
          <div key={s.step} className="flex-1 bg-[#1a1b25] border border-white/5 rounded-2xl p-5 text-left">
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">Paso {s.step}</span>
            </div>
            <p className="text-white font-semibold text-sm mb-1">{s.title}</p>
            <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base px-10 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105"
      >
        Comenzar análisis →
      </button>

      <p className="text-gray-600 text-xs mt-4">Gratis · Sin registro · Tus datos no se almacenan</p>
    </div>
  )
}
