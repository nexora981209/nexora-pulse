import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import MetaCallback from './pages/MetaCallback.tsx'
import Privacy from './pages/Privacy.tsx'

const path = window.location.pathname

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/meta-callback' ? <MetaCallback /> : path === '/privacy' ? <Privacy /> : <App />}
  </StrictMode>,
)
