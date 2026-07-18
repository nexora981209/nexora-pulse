import type { VercelRequest, VercelResponse } from '@vercel/node'

// Cron: runs every 3 days to prevent Supabase from pausing
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const url = process.env.SUPABASE_URL
  if (!url) return res.status(500).json({ error: 'SUPABASE_URL not set' })

  try {
    const ping = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': process.env.VITE_SUPABASE_KEY ?? '',
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_KEY ?? ''}`,
      },
    })
    return res.status(200).json({ ok: true, status: ping.status, ts: new Date().toISOString() })
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) })
  }
}
