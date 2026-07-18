import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type Plan = 'free' | 'starter' | 'pro' | 'agency'

export interface AuthState {
  user: User | null
  plan: Plan
  loading: boolean
}

export function useAuth(): AuthState & { signOut: () => Promise<void> } {
  const [user, setUser] = useState<User | null>(null)
  const [plan, setPlan] = useState<Plan>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      if (data.session?.user) fetchPlan(data.session.user.id)
      else setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchPlan(session.user.id)
      else { setPlan('free'); setLoading(false) }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchPlan(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single()
    setPlan((data?.plan as Plan) ?? 'free')
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, plan, loading, signOut }
}
