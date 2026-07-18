import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import Login from '../pages/Login'

interface Props { children: ReactNode }

export default function AuthGate({ children }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
        <div className="flex flex-col items-center gap-4">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="6" fill="#6366f1"/>
            <path d="M5 16L8.5 7L11 13L13.5 9L17 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) return <Login />

  return <>{children}</>
}
