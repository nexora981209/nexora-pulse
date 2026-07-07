# Metrixa

Plataforma de análisis de campañas Meta Ads. Conecta tu cuenta de Facebook Ads y obtén un diagnóstico automático de tus métricas (CTR, ROAS, CPC, CPA, frecuencia) con recomendaciones accionables.

## Stack
- React 19 + TypeScript + Vite
- Tailwind CSS
- Supabase (base de datos)
- Meta Graph API v19.0 (OAuth)
- Vercel (deploy)

## Variables de entorno requeridas
Crea un archivo `.env.local` con:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_KEY=...
VITE_META_APP_ID=...
```

## Desarrollo local
```bash
npm install
npm run dev
```
