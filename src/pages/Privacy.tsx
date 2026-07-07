export default function Privacy() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #3B82F6, #7C3AED)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 16 }}>M</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>Metrixa</span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Política de Privacidad</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 40 }}>Última actualización: julio 2026 · Versión 1.0</p>

        {[
          { n: 1, t: '¿Quiénes somos?', c: 'Metrixa es una plataforma de análisis de publicidad digital con sede en Colombia. Permite analizar el rendimiento de campañas en Meta Ads y obtener recomendaciones automatizadas. Contacto: nexora981209@gmail.com' },
          { n: 2, t: 'Qué datos recopilamos', c: 'Recopilamos métricas de campañas (CTR, ROAS, CPC, CPA, frecuencia), nombre de la cuenta publicitaria, token de acceso de Meta y correo electrónico opcional. No accedemos a publicaciones, mensajes, fotos ni lista de amigos.' },
          { n: 3, t: 'Cómo usamos tus datos', c: 'Los datos se usan exclusivamente para analizar el rendimiento de tus campañas, generar recomendaciones y guardar historial de análisis. No usamos tus datos para publicidad, venta a terceros ni perfilamiento comercial.' },
          { n: 4, t: 'Terceros', c: 'Usamos Supabase (base de datos), Vercel (hospedaje) y Meta API (autenticación y datos de Ads). No compartimos tu información con ningún otro tercero.' },
          { n: 5, t: 'Retención de datos', c: 'Los tokens de acceso se eliminan al revocar el acceso. Los snapshots se conservan hasta 20 entradas y el usuario puede eliminarlas en cualquier momento.' },
          { n: 6, t: 'Tus derechos', c: 'Puedes acceder, corregir, eliminar tus datos o revocar el acceso desde Configuración de Facebook → Aplicaciones. Para ejercer tus derechos escríbenos a nexora981209@gmail.com. Respondemos en máximo 15 días hábiles.' },
          { n: 7, t: 'Seguridad', c: 'Usamos HTTPS/TLS, Row Level Security en Supabase y acceso restringido por usuario. No almacenamos contraseñas — autenticación delegada a Meta OAuth.' },
          { n: 8, t: 'Cookies', c: 'Usamos localStorage y sessionStorage del navegador para preferencias y datos temporales. No usamos cookies de rastreo ni publicidad.' },
          { n: 9, t: 'Menores de edad', c: 'Metrixa está dirigido a profesionales y empresas. No recopilamos datos de menores de 18 años intencionalmente.' },
          { n: 10, t: 'Cambios a esta política', c: 'Notificaremos cambios significativos por correo o aviso en la plataforma. El uso continuado implica aceptación.' },
          { n: 11, t: 'Contacto', c: 'Email: nexora981209@gmail.com · País: Colombia · Reclamaciones ante la Superintendencia de Industria y Comercio (SIC): sic.gov.co' },
        ].map(s => (
          <div key={s.n} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28, marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#EFF6FF', color: '#3B82F6', width: 24, height: 24, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{s.n}</span>
              {s.t}
            </h2>
            <p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.8, margin: 0 }}>{s.c}</p>
          </div>
        ))}

        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 32 }}>© 2026 Metrixa · Colombia · Ley 1581 de 2012</p>
      </div>
    </div>
  )
}
