import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import MetaCallback from './pages/MetaCallback.tsx'
import Privacy from './pages/Privacy.tsx'
import Login from './pages/Login.tsx'
import AuthGate from './components/AuthGate.tsx'
import Admin from './pages/Admin.tsx'

const path = window.location.pathname

function Root() {
  if (path === '/meta-callback') return <MetaCallback />
  if (path === '/privacy')       return <Privacy />
  if (path === '/login')         return <Login />
  if (path === '/admin')         return <Admin />
  return <AuthGate><App /></AuthGate>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
