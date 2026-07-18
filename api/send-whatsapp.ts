import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify caller is authenticated via Supabase JWT
  const authHeader = req.headers['authorization']
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }

  const { number, text } = req.body as { number?: string; text?: string }

  if (!number || !text) {
    return res.status(400).json({ error: 'number y text son requeridos' })
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    return res.status(500).json({ error: 'WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN no configurados en Vercel' })
  }

  const clean = number.replace(/\D/g, '')
  if (clean.length < 8) {
    return res.status(400).json({ error: 'Número de teléfono inválido' })
  }

  try {
    const upstream = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: clean,
          type: 'text',
          text: { body: text },
        }),
      }
    )

    const data = await upstream.json().catch(() => ({})) as { messages?: { id: string }[]; error?: { message: string } }

    if (upstream.ok) {
      return res.status(200).json({ success: true, messageId: data.messages?.[0]?.id })
    }

    return res.status(upstream.status).json({ success: false, error: data.error?.message ?? `Error ${upstream.status}` })
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) })
  }
}
